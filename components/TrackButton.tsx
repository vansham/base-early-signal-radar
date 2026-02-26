'use client'
import { useState } from 'react'

export default function TrackButton({ pairId, pair: _pair }: { pairId: string; pair: string }) {
  const key = `tracked_${pairId}`
  const [tracked, setTracked] = useState(() => typeof window !== 'undefined' ? localStorage.getItem(key) === 'true' : false)
  const toggle = () => { const next = !tracked; setTracked(next); localStorage.setItem(key, String(next)) }
  return (
    <button onClick={toggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: tracked ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)', background: tracked ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', color: tracked ? '#f59e0b' : '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
      ⭐ {tracked ? 'TRACKED' : 'TRACK'}
    </button>
  )
}
