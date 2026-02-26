import { RadarItem, AnomalyType } from './types'
import { calculateRiskScore, scoreToRiskLevel } from './scoring'

const MOCK_RADAR_DATA: Omit<RadarItem, 'riskScore' | 'riskLevel'>[] = [
  { id: '1', pair: 'DEGEN/WETH', token0: 'DEGEN', token1: 'WETH', liquidity: 18500, volume24h: 142000, ageMinutes: 3, dex: 'Uniswap V3', deployer: '0x4f3a...91bc', isKnownDeployer: false, anomalyType: 'NEW_POOL', txCount: 12, priceChange1h: 85.4, contractVerified: false, timestamp: Date.now() - 3 * 60 * 1000 },
  { id: '2', pair: 'cbBTC/USDC', token0: 'cbBTC', token1: 'USDC', liquidity: 2_400_000, volume24h: 8_900_000, ageMinutes: 14, dex: 'Aerodrome', deployer: '0xCoinbase', isKnownDeployer: true, anomalyType: 'LIQUIDITY_SPIKE', txCount: 847, priceChange1h: 3.2, contractVerified: true, timestamp: Date.now() - 14 * 60 * 1000 },
  { id: '3', pair: 'BRETT/USDC', token0: 'BRETT', token1: 'USDC', liquidity: 4200, volume24h: 31000, ageMinutes: 1, dex: 'BaseSwap', deployer: '0x9d2e...33fa', isKnownDeployer: false, anomalyType: 'NEW_TOKEN', txCount: 4, priceChange1h: 220.0, contractVerified: false, timestamp: Date.now() - 1 * 60 * 1000 },
  { id: '4', pair: 'TOSHI/WETH', token0: 'TOSHI', token1: 'WETH', liquidity: 89000, volume24h: 560000, ageMinutes: 45, dex: 'Uniswap V3', deployer: '0x7a1c...88de', isKnownDeployer: true, anomalyType: 'UNUSUAL_VOLUME', txCount: 312, priceChange1h: 18.7, contractVerified: true, timestamp: Date.now() - 45 * 60 * 1000 },
  { id: '5', pair: 'MOCHI/USDC', token0: 'MOCHI', token1: 'USDC', liquidity: 7800, volume24h: 94000, ageMinutes: 8, dex: 'SushiSwap', deployer: '0xf8ab...21cd', isKnownDeployer: false, anomalyType: 'WHALE_ENTRY', txCount: 28, priceChange1h: 42.3, contractVerified: false, timestamp: Date.now() - 8 * 60 * 1000 },
  { id: '6', pair: 'USDbC/USDC', token0: 'USDbC', token1: 'USDC', liquidity: 12_000_000, volume24h: 3_200_000, ageMinutes: 2880, dex: 'Curve', deployer: '0xCurve', isKnownDeployer: true, anomalyType: 'LIQUIDITY_SPIKE', txCount: 5420, priceChange1h: 0.01, contractVerified: true, timestamp: Date.now() - 2880 * 60 * 1000 },
  { id: '7', pair: 'NORMIE/WETH', token0: 'NORMIE', token1: 'WETH', liquidity: 3200, volume24h: 28000, ageMinutes: 2, dex: 'Unknown DEX', deployer: '0x2b9f...44aa', isKnownDeployer: false, anomalyType: 'RAPID_MINT', txCount: 7, priceChange1h: 310.5, contractVerified: false, timestamp: Date.now() - 2 * 60 * 1000 },
  { id: '8', pair: 'VIRTUAL/USDC', token0: 'VIRTUAL', token1: 'USDC', liquidity: 340000, volume24h: 1_800_000, ageMinutes: 120, dex: 'Aerodrome', deployer: '0xVirtuals', isKnownDeployer: true, anomalyType: 'UNUSUAL_VOLUME', txCount: 1204, priceChange1h: 12.5, contractVerified: true, timestamp: Date.now() - 120 * 60 * 1000 },
]

export function detectAnomalies(): RadarItem[] {
  return MOCK_RADAR_DATA.map(item => {
    const score = calculateRiskScore({
      liquidity: item.liquidity,
      ageMinutes: item.ageMinutes,
      dex: item.dex,
      isKnownDeployer: item.isKnownDeployer,
      contractVerified: item.contractVerified,
      txCount: item.txCount,
      priceChange1h: item.priceChange1h,
    })
    return { ...item, riskScore: score, riskLevel: scoreToRiskLevel(score) }
  }).sort((a, b) => a.riskScore - b.riskScore)
}

export function getAnomalyLabel(type: AnomalyType): string {
  const labels: Record<AnomalyType, string> = {
    NEW_POOL: '🆕 New Pool',
    LIQUIDITY_SPIKE: '💧 Liquidity Spike',
    UNUSUAL_VOLUME: '📈 Unusual Volume',
    NEW_TOKEN: '⚡ New Token',
    WHALE_ENTRY: '🐋 Whale Entry',
    RAPID_MINT: '🔥 Rapid Mint',
  }
  return labels[type]
}
