'use client'
import { RiskLevel } from '@/lib/types'

interface RiskBadgeProps { level: RiskLevel; score?: number; size?: 'sm' | 'md' }

export default function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const config = {
    LOW: { label: 'LOW RISK', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#10b981' },
    MEDIUM: { label: 'MEDIUM', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', color: '#f59e0b' },
    HIGH: { label: 'HIGH RISK', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#ef4444' },
  }
  const c = config[level]
  const isSmall = size === 'sm'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: isSmall ? 4 : 6, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: isSmall ? '2px 7px' : '3px 10px', fontSize: isSmall ? 9 : 10, fontWeight: 800, letterSpacing: '0.1em', color: c.color, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}`, animation: level === 'HIGH' ? 'pulse 1.5s infinite' : 'none', flexShrink: 0 }} />
      {c.label}{score !== undefined && <span style={{ opacity: 0.7, marginLeft: 2 }}>({score})</span>}
    </span>
  )
}
