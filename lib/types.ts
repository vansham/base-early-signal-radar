export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type AnomalyType =
  | 'NEW_POOL'
  | 'LIQUIDITY_SPIKE'
  | 'UNUSUAL_VOLUME'
  | 'NEW_TOKEN'
  | 'WHALE_ENTRY'
  | 'RAPID_MINT'

export type DexName = 'Uniswap V3' | 'Aerodrome' | 'BaseSwap' | 'SushiSwap' | 'Curve' | 'Unknown DEX' | string

export type DeployerSignal = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

export interface RadarItem {
  id: string
  pair: string
  token0: string
  token1: string
  liquidity: number
  volume24h: number
  ageMinutes: number
  dex: DexName
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
  dex: DexName
  isKnownDeployer: boolean
  contractVerified: boolean
  txCount: number
  priceChange1h: number
}

export interface RiskBreakdown {
  liquiditySignal: DeployerSignal
  ageSignal: DeployerSignal
  dexSignal: DeployerSignal
  deployerSignal: DeployerSignal
  contractSignal: DeployerSignal
  priceSignal: DeployerSignal
}

export interface RiskScoreResult {
  score: number
  level: RiskLevel
  breakdown: RiskBreakdown
}

export interface RadarApiResponse {
  success: boolean
  count: number
  timestamp: number
  data: RadarItem[]
}

export interface RiskApiResponse {
  success: boolean
  score: number
  level: RiskLevel
  breakdown: RiskBreakdown
}

export interface AlertSubscription {
  id: string
  pairId: string
  pair: string
  createdAt: number
}

export interface StatsSummary {
  high: number
  medium: number
  low: number
  totalLiquidity: number
  totalVolume: number
}
