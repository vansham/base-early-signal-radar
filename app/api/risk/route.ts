import { NextRequest, NextResponse } from 'next/server'
import { calculateRiskScore, scoreToRiskLevel } from '@/lib/scoring'

const BASESCAN_KEY = process.env.BASESCAN_API_KEY!
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY!
const BASE_RPC = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  })
  const json = await res.json()
  return json.result
}

async function deepScanContract(address: string) {
  const flags: string[] = []
  const details: Record<string, unknown> = {}

  try {
    // 1. Check if contract is verified on Basescan
    const verifyRes = await fetch(
      `https://api.basescan.org/api?module=contract&action=getsourcecode&address=${address}&apikey=${BASESCAN_KEY}`
    )
    const verifyData = await verifyRes.json()
    const isVerified = verifyData.result?.[0]?.SourceCode !== ''
    details.contractVerified = isVerified
    if (!isVerified) flags.push('Unverified contract')

    // 2. Check transaction count
    const txCount = await rpc('eth_getTransactionCount', [address, 'latest'])
    const txNum = parseInt(txCount || '0', 16)
    details.txCount = txNum
    if (txNum < 10) flags.push('Very low tx count')

    // 3. Check ETH balance
    const balance = await rpc('eth_getBalance', [address, 'latest'])
    const balanceEth = parseInt(balance || '0', 16) / 1e18
    details.balance = balanceEth.toFixed(4) + ' ETH'

    // 4. Get recent transactions from Basescan
    const txRes = await fetch(
      `https://api.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=10&apikey=${BASESCAN_KEY}`
    )
    const txData = await txRes.json()
    const recentTxs = txData.result || []
    details.recentTxCount = recentTxs.length

    // 5. Check contract creation age
    if (recentTxs.length > 0) {
      const oldest = recentTxs[recentTxs.length - 1]
      const ageMinutes = Math.floor((Date.now() / 1000 - parseInt(oldest.timeStamp)) / 60)
      details.ageMinutes = ageMinutes
      if (ageMinutes < 10) flags.push('Contract < 10 minutes old')
      if (ageMinutes < 60) flags.push('Contract < 1 hour old')
    }

    // 6. Check token transfers for wash trading
    const tokenRes = await fetch(
      `https://api.basescan.org/api?module=account&action=tokentx&address=${address}&sort=desc&page=1&offset=20&apikey=${BASESCAN_KEY}`
    )
    const tokenData = await tokenRes.json()
    const tokenTxs = tokenData.result || []

    // Detect circular transactions
    const senders = tokenTxs.map((t: {from: string}) => t.from.toLowerCase())
    const receivers = tokenTxs.map((t: {to: string}) => t.to.toLowerCase())
    const circular = senders.filter((s: string) => receivers.includes(s))
    if (circular.length > 3) flags.push('Possible wash trading detected')

    details.tokenTxCount = tokenTxs.length

  } catch (err) {
    console.error('[Deep Scan Error]', err)
    flags.push('Scan partially failed')
  }

  return { flags, details }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { liquidity, ageMinutes, dex, isKnownDeployer, contractVerified, txCount, priceChange1h, contractAddress } = body

    const score = calculateRiskScore({ liquidity, ageMinutes, dex, isKnownDeployer, contractVerified, txCount, priceChange1h })
    const level = scoreToRiskLevel(score)

    let deepScan = null
    if (contractAddress) {
      deepScan = await deepScanContract(contractAddress)
    }

    return NextResponse.json({
      success: true, score, level,
      deepScan,
      breakdown: {
        liquiditySignal: liquidity > 200_000 ? 'POSITIVE' : liquidity < 20_000 ? 'NEGATIVE' : 'NEUTRAL',
        ageSignal: ageMinutes > 60 ? 'POSITIVE' : ageMinutes < 5 ? 'NEGATIVE' : 'NEUTRAL',
        dexSignal: ['Uniswap V3','Aerodrome','BaseSwap','SushiSwap','Curve'].includes(dex) ? 'POSITIVE' : 'NEGATIVE',
        deployerSignal: isKnownDeployer ? 'POSITIVE' : 'NEGATIVE',
        contractSignal: contractVerified ? 'POSITIVE' : 'NEGATIVE',
      }
    })
  } catch (err) {
    console.error('[Risk API Error]', err)
    return NextResponse.json({ success: false, error: 'Risk scoring failed' }, { status: 500 })
  }
}
