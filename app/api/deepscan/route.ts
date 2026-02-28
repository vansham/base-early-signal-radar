import { NextRequest, NextResponse } from 'next/server'

const BASESCAN = process.env.BASESCAN_API_KEY!
const ALCHEMY = process.env.ALCHEMY_API_KEY!
const RPC = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY}`

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  })
  const json = await res.json()
  return json.result
}

async function bscan(params: Record<string, string>) {
  const url = new URL('https://api.basescan.org/api')
  Object.entries({ ...params, apikey: BASESCAN }).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  return res.json()
}

export async function POST(req: NextRequest) {
  const { contractAddress, pair } = await req.json()
  const results: Record<string, unknown> = { pair, contractAddress, timestamp: Date.now() }
  const flags: string[] = []
  const positives: string[] = []

  try {
    const sourceData = await bscan({ module: 'contract', action: 'getsourcecode', address: contractAddress })
    const isVerified = sourceData.result?.[0]?.SourceCode !== '' && sourceData.result?.[0]?.SourceCode !== undefined
    results.contractVerified = isVerified
    results.contractName = sourceData.result?.[0]?.ContractName || 'Unknown'
    results.compiler = sourceData.result?.[0]?.CompilerVersion || 'Unknown'
    if (isVerified) positives.push('Contract source verified on Basescan')
    else flags.push('Contract source NOT verified')

    const txData = await bscan({ module: 'account', action: 'txlist', address: contractAddress, sort: 'desc', page: '1', offset: '20' })
    const txs = Array.isArray(txData.result) ? txData.result : []
    results.recentTxCount = txs.length
    if (txs.length < 5) flags.push('Very few transactions')
    else positives.push(txs.length + ' recent transactions')

    const tokenData = await bscan({ module: 'account', action: 'tokentx', address: contractAddress, sort: 'desc', page: '1', offset: '50' })
    const tokenTxs = Array.isArray(tokenData.result) ? tokenData.result : []
    results.tokenTxCount = tokenTxs.length
    const senders = new Set(tokenTxs.map((t: {from: string}) => t.from.toLowerCase()))
    const receivers = new Set(tokenTxs.map((t: {to: string}) => t.to.toLowerCase()))
    const circular = Array.from(senders).filter((s: unknown) => receivers.has(s as string)).length
    if (circular > 5) flags.push('Possible wash trading (' + circular + ' circular addresses)')

    const balance = await rpc('eth_getBalance', [contractAddress, 'latest'])
    const balanceEth = (parseInt(balance || '0', 16) / 1e18).toFixed(4)
    results.balance = balanceEth + ' ETH'
    if (parseFloat(balanceEth) === 0) flags.push('Zero ETH balance')

    const code = await rpc('eth_getCode', [contractAddress, 'latest'])
    results.hasCode = code && code !== '0x'
    if (!results.hasCode) flags.push('No contract code found')
    else positives.push('Contract code present onchain')

    if (txs.length > 0) {
      const oldest = txs[txs.length - 1]
      const ageMinutes = Math.floor((Date.now() / 1000 - parseInt(oldest.timeStamp || '0')) / 60)
      results.ageMinutes = ageMinutes
      const ageStr = ageMinutes < 60 ? ageMinutes + 'm' : ageMinutes < 1440 ? Math.floor(ageMinutes/60) + 'h' : Math.floor(ageMinutes/1440) + 'd'
      results.age = ageStr
      if (ageMinutes < 10) flags.push('Very new contract — only ' + ageStr + ' old')
      else if (ageMinutes > 1440) positives.push('Contract is ' + ageStr + ' old')
    }

    const riskScore = Math.min(100, Math.max(0, 100 - (flags.length * 20) + (positives.length * 10)))
    const riskLevel = riskScore >= 65 ? 'LOW' : riskScore >= 35 ? 'MEDIUM' : 'HIGH'

    return NextResponse.json({ success: true, riskScore, riskLevel, flags, positives, details: results })
  } catch (err) {
    console.error('[DeepScan Error]', err)
    return NextResponse.json({ success: false, error: 'Scan failed' }, { status: 500 })
  }
}
