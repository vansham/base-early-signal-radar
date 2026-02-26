import { NextResponse } from 'next/server'
import { detectAnomalies } from '@/lib/anomaly'

export async function GET() {
  try {
    const items = detectAnomalies()
    return NextResponse.json({ success: true, count: items.length, timestamp: Date.now(), data: items })
  } catch (err) {
    console.error('[Radar API Error]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch radar data' }, { status: 500 })
  }
}
