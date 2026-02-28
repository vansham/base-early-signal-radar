import { NextResponse } from 'next/server'
import { calculateRiskScore, scoreToRiskLevel } from '@/lib/scoring'
import { RadarItem, AnomalyType } from '@/lib/types'

const BASESCAN_KEY = process.env.BASESCAN_API_KEY!

async function fetchRealPools(): Promise<RadarItem[]> {
  try {
    // DexScreener - real Base new pools, no API key needed!
    const res = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      headers: { 'User-Agent': 'BaseRadar/1.0' },
      next: { revalidate: 30 }
    })
    const profiles = await res.json()

    // Also fetch latest pairs on Base
    const pairsRes = await fetch('https://api.dexscreener.com/latest/dex/search?q=base+new', {
      headers: { 'User-Agent': 'BaseRadar/1.0' },
      next: { revalidate: 30 }
    })
    const pairsData = await pairsRes.json()
    const pairs = pairsData.pairs?.filter((p: {chainId: string}) => p.chainId === 'base').slice(0, 12) || []

    if (pairs.length === 0) return []

    const items: RadarItem[] = pairs.map((pair: {
      pairAddress: string
      baseToken: { symbol: string; address: string; name: string }
      quoteToken: { symbol: string; address: string }
      liquidity?: { usd?: number }
      volume?: { h24?: number }
      pairCreatedAt?: number
      dexId: string
      txns?: { h24?: { buys?: number; sells?: number } }
      priceChange?: { h1?: number }
    }, i: number) => {
      const liquidity = pair.liquidity?.usd || 0
      const volume24h = pair.volume?.h24 || 0
      const ageMinutes = pair.pairCreatedAt
        ? Math.floor((Date.now() - pair.pairCreatedAt) / 60000)
        : 60
      const txCount = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)
      const priceChange1h = pair.priceChange?.h1 || 0

      const dexMap: Record<string, string> = {
        uniswapv3: 'Uniswap V3',
        aerodrome: 'Aerodrome',
        baseswap: 'BaseSwap',
        sushiswap: 'SushiSwap',
        curve: 'Curve',
        swapbased: 'SwapBased',
      }
      const dex = dexMap[pair.dexId?.toLowerCase()] || pair.dexId || 'Unknown DEX'
      const isKnownDex = !!dexMap[pair.dexId?.toLowerCase()]

      // Anomaly detection
      let anomalyType: AnomalyType = 'UNUSUAL_VOLUME'
      if (ageMinutes < 120) anomalyType = 'NEW_POOL'
      else if (ageMinutes < 360) anomalyType = 'NEW_TOKEN'
      else if (Math.abs(priceChange1h) > 50) anomalyType = 'RAPID_MINT'
      else if (volume24h > liquidity * 2) anomalyType = 'WHALE_ENTRY'
      else if (liquidity > 500000) anomalyType = 'LIQUIDITY_SPIKE'

      const score = calculateRiskScore({
        liquidity,
        ageMinutes,
        dex,
        isKnownDeployer: isKnownDex,
        contractVerified: isKnownDex,
        txCount,
        priceChange1h,
      })

      return {
        id: pair.pairAddress || String(i),
        pair: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
        token0: pair.baseToken.symbol,
        token1: pair.quoteToken.symbol,
        liquidity,
        volume24h,
        ageMinutes,
        dex,
        deployer: pair.pairAddress,
        isKnownDeployer: isKnownDex,
        anomalyType,
        riskScore: score,
        riskLevel: scoreToRiskLevel(score),
        txCount,
        priceChange1h,
        contractVerified: isKnownDex,
        timestamp: pair.pairCreatedAt || Date.now(),
      } as RadarItem
    })

    return items.sort((a, b) => a.riskScore - b.riskScore)
  } catch (err) {
    console.error('[DexScreener Error]', err)
    return []
  }
}

export async function GET() {
  try {
    const items = await fetchRealPools()

    if (items.length === 0) {
      const { detectAnomalies } = await import('@/lib/anomaly')
      const mock = detectAnomalies()
      return NextResponse.json({ success: true, count: mock.length, timestamp: Date.now(), data: mock, source: 'mock' })
    }

    return NextResponse.json({ success: true, count: items.length, timestamp: Date.now(), data: items, source: 'live' })
  } catch (err) {
    console.error('[Radar API Error]', err)
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
