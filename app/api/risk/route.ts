import { NextRequest, NextResponse } from 'next/server'
import { calculateRiskScore, scoreToRiskLevel } from '@/lib/scoring'
import { RiskScoreInput } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: RiskScoreInput = await req.json()
    if (body.liquidity === undefined || body.ageMinutes === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }
    const score = calculateRiskScore(body)
    const level = scoreToRiskLevel(score)
    return NextResponse.json({ success: true, score, level })
  } catch (err) {
    console.error('[Risk API Error]', err)
    return NextResponse.json({ success: false, error: 'Risk scoring failed' }, { status: 500 })
  }
}
