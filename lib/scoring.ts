import { RiskLevel, RiskScoreInput } from './types'

const KNOWN_DEXES = ['Uniswap V3', 'Aerodrome', 'BaseSwap', 'SushiSwap', 'Curve']

export function calculateRiskScore(input: RiskScoreInput): number {
  let score = 50

  if (input.liquidity > 200_000) score += 20
  else if (input.liquidity > 50_000) score += 10

  if (input.ageMinutes > 60) score += 15
  else if (input.ageMinutes > 30) score += 8

  if (KNOWN_DEXES.includes(input.dex)) score += 15
  if (input.isKnownDeployer) score += 15
  if (input.contractVerified) score += 10
  if (input.txCount > 100) score += 5

  if (input.liquidity < 20_000) score -= 20
  else if (input.liquidity < 5_000) score -= 35

  if (input.ageMinutes < 5) score -= 25
  else if (input.ageMinutes < 15) score -= 12

  if (!KNOWN_DEXES.includes(input.dex)) score -= 10
  if (!input.isKnownDeployer) score -= 15
  if (!input.contractVerified) score -= 10

  if (Math.abs(input.priceChange1h) > 50) score -= 20
  else if (Math.abs(input.priceChange1h) > 20) score -= 8

  return Math.max(0, Math.min(100, score))
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 65) return 'LOW'
  if (score >= 35) return 'MEDIUM'
  return 'HIGH'
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return '#10b981'
    case 'MEDIUM': return '#f59e0b'
    case 'HIGH': return '#ef4444'
  }
}

export function formatLiquidity(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

export function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  return `${Math.floor(minutes / 1440)}d`
}
