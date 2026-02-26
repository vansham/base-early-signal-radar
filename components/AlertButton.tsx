'use client'
import { useState } from 'react'

export default function AlertButton({ pairId, pair }: { pairId: string; pair: string }) {
  const key = `alert_${pairId}`
  const [alerted, setAlerted] = useState(() => typeof window !== 'undefined' ? localStorage.getItem(key) === 'true' : false)
  const [showModal, setShowModal] = useState(false)
  const confirm = () => { setAlerted(true); localStorage.setItem(key, 'true'); setShowModal(false) }
  return (
    <>
      <button onClick={() => alerted ? null : setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: alerted ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.1)', background: alerted ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)', color: alerted ? '#10b981' : '#94a3b8', fontSize: 11, fontWeight: 600, cursor: alerted ? 'default' : 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
        🔔 {alerted ? 'NOTIFYING' : 'NOTIFY ME'}
      </button>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#0f1624', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: 28, maxWidth: 380, width: '100%' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 11, color: '#3b82f6', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 12 }}>ALERT SETUP</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Track {pair} activity</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>Alerts stored locally — no account required.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={confirm} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Enable Alerts</button>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
