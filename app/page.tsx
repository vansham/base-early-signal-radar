'use client'
import { useState, useEffect, useMemo } from 'react'
import { RadarItem } from '@/lib/types'
import RadarCard from '@/components/RadarCard'
import IntentSearch from '@/components/IntentSearch'

export default function HomePage() {
  const [items, setItems] = useState<RadarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/radar')
      const json = await res.json()
      if (json.success) { setItems(json.data); setLastUpdated(new Date()) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 30_000); return () => clearInterval(interval) }, [])

  const filtered = useMemo(() => items.filter(item => {
    const q = query.toLowerCase()
    const matchesQuery = !q || item.pair.toLowerCase().includes(q) || item.dex.toLowerCase().includes(q) || item.anomalyType.toLowerCase().includes(q.replace(' ', '_'))
    const matchesFilter = filter === 'all' || item.riskLevel.toLowerCase() === filter
    return matchesQuery && matchesFilter
  }), [items, query, filter])

  const stats = useMemo(() => ({
    high: items.filter(i => i.riskLevel === 'HIGH').length,
    medium: items.filter(i => i.riskLevel === 'MEDIUM').length,
    low: items.filter(i => i.riskLevel === 'LOW').length,
    totalLiquidity: items.reduce((a, b) => a + b.liquidity, 0),
  }), [items])

  return (
    <main style={{ minHeight: '100vh', background: '#050a14', color: '#f1f5f9', fontFamily: '"IBM Plex Mono", "Courier New", monospace' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, paddingBottom: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 9, color: '#3b82f6', letterSpacing: '0.2em', fontWeight: 700 }}>LIVE — BASE MAINNET</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
                Base Early Signal<br /><span style={{ color: '#3b82f6' }}>Radar</span>
              </h1>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>See what&apos;s moving on Base before everyone else.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <button onClick={fetchData} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', fontFamily: 'monospace' }}>⟳ REFRESH</button>
              {lastUpdated && <span style={{ fontSize: 9, color: '#334155', letterSpacing: '0.05em' }}>UPDATED {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'SIGNALS', value: items.length.toString(), color: '#94a3b8' },
              { label: 'HIGH RISK', value: stats.high.toString(), color: '#ef4444' },
              { label: 'MEDIUM', value: stats.medium.toString(), color: '#f59e0b' },
              { label: 'LOW RISK', value: stats.low.toString(), color: '#10b981' },
              { label: 'TOTAL LIQUIDITY', value: stats.totalLiquidity >= 1_000_000 ? `$${(stats.totalLiquidity / 1_000_000).toFixed(1)}M` : `$${(stats.totalLiquidity / 1000).toFixed(0)}K`, color: '#3b82f6' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 8, color: '#334155', letterSpacing: '0.12em', marginBottom: 3, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </header>

        <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
          {['Non-custodial. We never control your funds.', 'All transactions happen in your wallet.', 'Intelligence only. No trading interface.'].map(t => (
            <span key={t} style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#10b981' }}>✓</span> {t}
            </span>
          ))}
        </div>

        <IntentSearch value={query} onChange={setQuery} resultCount={filtered.length} />

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 5, border: `1px solid ${filter === f ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`, background: filter === f ? 'rgba(59,130,246,0.1)' : 'transparent', color: filter === f ? '#93c5fd' : '#475569', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {f === 'all' ? `ALL (${items.length})` : f === 'high' ? `HIGH (${stats.high})` : f === 'medium' ? `MED (${stats.medium})` : `LOW (${stats.low})`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 9, color: '#ef4444', letterSpacing: '0.15em', fontWeight: 700 }}>🚨 WEIRD ACTIVITY FEED</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          <span style={{ fontSize: 9, color: '#334155', letterSpacing: '0.1em' }}>{filtered.length} SIGNALS</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 12, color: '#334155', letterSpacing: '0.1em', animation: 'pulse 1.5s infinite' }}>SCANNING BASE NETWORK...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 12, color: '#334155', letterSpacing: '0.1em' }}>NO SIGNALS MATCH YOUR QUERY</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(item => <RadarCard key={item.id} item={item} />)}
          </div>
        )}

        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 9, color: '#1e293b', letterSpacing: '0.1em' }}>BASE EARLY SIGNAL RADAR — POWERED BY BASE NETWORK</span>
          <span style={{ fontSize: 9, color: '#1e293b', letterSpacing: '0.1em' }}>NOT FINANCIAL ADVICE. INTELLIGENCE TOOL ONLY.</span>
        </footer>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #334155; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050a14; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>
    </main>
  )
}
