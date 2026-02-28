import { RadarItem } from './types'
import { calculateRiskScore, scoreToRiskLevel } from './scoring'

const raw = [
  { id: '1', pair: 'DEGEN/WETH', token0: 'DEGEN', token1: 'WETH', liquidity: 18500, volume24h: 142000, ageMinutes: 3, dex: 'Uniswap V3', deployer: '0x4200000000000000000000000000000000000006', isKnownDeployer: false, anomalyType: 'NEW_POOL', txCount: 12, priceChange1h: 85.4, contractVerified: false, timestamp: Date.now() - 3 * 60 * 1000 },
  { id: '2', pair: 'cbBTC/USDC', token0: 'cbBTC', token1: 'USDC', liquidity: 2_400_000, volume24h: 8_900_000, ageMinutes: 14, dex: 'Aerodrome', deployer: '0x1ceA84203673764244E05693e42E6Ace62bE9BA5', isKnownDeployer: true, anomalyType: 'LIQUIDITY_SPIKE', txCount: 847, priceChange1h: 3.2, contractVerified: true, timestamp: Date.now() - 14 * 60 * 1000 },
  { id: '3', pair: 'BRETT/USDC', token0: 'BRETT', token1: 'USDC', liquidity: 4200, volume24h: 31000, ageMinutes: 1, dex: 'BaseSwap', deployer: '0x9d2e791cfa2e55b08f7d9e393fb5b3b9f3f3f3f3', isKnownDeployer: false, anomalyType: 'NEW_TOKEN', txCount: 4, priceChange1h: 220.0, contractVerified: false, timestamp: Date.now() - 1 * 60 * 1000 },
  { id: '4', pair: 'TOSHI/WETH', token0: 'TOSHI', token1: 'WETH', liquidity: 89000, volume24h: 560000, ageMinutes: 45, dex: 'Uniswap V3', deployer: '0x4200000000000000000000000000000000000006', isKnownDeployer: true, anomalyType: 'UNUSUAL_VOLUME', txCount: 312, priceChange1h: 18.7, contractVerified: true, timestamp: Date.now() - 45 * 60 * 1000 },
  { id: '5', pair: 'MOCHI/USDC', token0: 'MOCHI', token1: 'USDC', liquidity: 7800, volume24h: 94000, ageMinutes: 8, dex: 'SushiSwap', deployer: '0xf8ab3c7b2e1d9f4a5c6e7d8b9a0c1d2e3f4a5b6c', isKnownDeployer: false, anomalyType: 'WHALE_ENTRY', txCount: 28, priceChange1h: 42.3, contractVerified: false, timestamp: Date.now() - 8 * 60 * 1000 },
  { id: '6', pair: 'USDbC/USDC', token0: 'USDbC', token1: 'USDC', liquidity: 12_000_000, volume24h: 3_200_000, ageMinutes: 2880, dex: 'Curve', deployer: '0x4c36388be6f416a29c8d8Eee81C771cE6bE14B5', isKnownDeployer: true, anomalyType: 'LIQUIDITY_SPIKE', txCount: 5420, priceChange1h: 0.01, contractVerified: true, timestamp: Date.now() - 2880 * 60 * 1000 },
  { id: '7', pair: 'NORMIE/WETH', token0: 'NORMIE', token1: 'WETH', liquidity: 3200, volume24h: 28000, ageMinutes: 2, dex: 'Unknown DEX', deployer: '0x2b9f3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', isKnownDeployer: false, anomalyType: 'RAPID_MINT', txCount: 7, priceChange1h: 310.5, contractVerified: false, timestamp: Date.now() - 2 * 60 * 1000 },
  { id: '8', pair: 'VIRTUAL/USDC', token0: 'VIRTUAL', token1: 'USDC', liquidity: 340000, volume24h: 1_800_000, ageMinutes: 120, dex: 'Aerodrome', deployer: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1', isKnownDeployer: true, anomalyType: 'UNUSUAL_VOLUME', txCount: 1204, priceChange1h: 12.5, contractVerified: true, timestamp: Date.now() - 120 * 60 * 1000 },
]

export function detectAnomalies(): RadarItem[] {
  return raw.map(item => {
    const score = calculateRiskScore({
      liquidity: item.liquidity,
      ageMinutes: item.ageMinutes,
      dex: item.dex,
      isKnownDeployer: item.isKnownDeployer,
      contractVerified: item.contractVerified,
      txCount: item.txCount,
      priceChange1h: item.priceChange1h,
    })
    return { ...item, riskScore: score, riskLevel: scoreToRiskLevel(score) } as RadarItem
  })
}

export function getAnomalyLabel(type: string): string {
  const labels: Record<string, string> = {
    NEW_POOL: 'New Pool',
    LIQUIDITY_SPIKE: 'Liquidity Spike',
    UNUSUAL_VOLUME: 'Unusual Volume',
    NEW_TOKEN: 'New Token',
    WHALE_ENTRY: 'Whale Entry',
    RAPID_MINT: 'Rapid Mint',
  }
  return labels[type] || type
}
