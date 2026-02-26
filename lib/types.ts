export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type AnomalyType =
  | 'NEW_POOL'
  | 'LIQUIDITY_SPIKE'
  | 'UNUSUAL_VOLUME'
  | 'NEW_TOKEN'
  | 'WHALE_ENTRY'
  | 'RAPID_MINT'

export interface RadarItem {
  id: string
  pair: string
  token0: string
  token1: string
  liquidity: number
  volume24h: number
  ageMinutes: number
  dex: string
  deployer: string
  isKnownDeployer: boolean
  anomalyType: AnomalyType
  riskScore: number
  riskLevel: RiskLevel
  txCount: number
  priceChange1h: number
  contractVerified: boolean
  timestamp: number
}

export interface RiskScoreInput {
  liquidity: number
  ageMinutes: number
  dex: string
  isKnownDeployer: boolean
  contractVerified: boolean
  txCount: number
  priceChange1h: number
}
