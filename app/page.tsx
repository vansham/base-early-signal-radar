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
  const [tick, setTick] = useState(0)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/radar')
      const json = await res.json()
      if (json.success) { setItems(json.data); setLastUpdated(new Date()) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000)
    const tickInterval = setInterval(() => setTick(t => t + 1), 1000)
    return () => { clearInterval(interval); clearInterval(tickInterval) }
  }, [])

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
    totalVolume: items.reduce((a, b) => a + b.volume24h, 0),
  }), [items])

  return (
    <main className="radar-main">
      {/* Grid background */}
      <div className="grid-bg" />
      {/* Corner decorations */}
      <div className="corner-tl" />
      <div className="corner-tr" />

      <div className="container">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-item">BASE NETWORK</span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item">MAINNET</span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item live-dot">
              <span className="pulse-dot" />
              LIVE FEED
            </span>
          </div>
          <div className="topbar-right">
            <span className="topbar-item">{new Date().toUTCString().slice(0, 25)}</span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item">SIGNALS: {items.length}</span>
          </div>
        </div>

        {/* Hero header */}
        <header className="hero">
          <div className="hero-left">
            <div className="hero-badge">INTELLIGENCE PLATFORM v2.0</div>
            <h1 className="hero-title">
              <span className="title-base">BASE</span>
              <span className="title-early"> EARLY</span>
              <br />
              <span className="title-signal">SIGNAL RADAR</span>
            </h1>
            <p className="hero-sub">Detect anomalies on Base before the crowd. Non-custodial. Intelligence only.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-label">TOTAL SIGNALS</div>
              <div className="stat-value">{items.length}</div>
              <div className="stat-bar" style={{ width: '100%' }} />
            </div>
            <div className="stat-card stat-high">
              <div className="stat-label">HIGH RISK</div>
              <div className="stat-value stat-red">{stats.high}</div>
              <div className="stat-bar stat-bar-red" style={{ width: `${items.length ? (stats.high / items.length) * 100 : 0}%` }} />
            </div>
            <div className="stat-card stat-med">
              <div className="stat-label">MEDIUM</div>
              <div className="stat-value stat-yellow">{stats.medium}</div>
              <div className="stat-bar stat-bar-yellow" style={{ width: `${items.length ? (stats.medium / items.length) * 100 : 0}%` }} />
            </div>
            <div className="stat-card stat-low">
              <div className="stat-label">LOW RISK</div>
              <div className="stat-value stat-green">{stats.low}</div>
              <div className="stat-bar stat-bar-green" style={{ width: `${items.length ? (stats.low / items.length) * 100 : 0}%` }} />
            </div>
            <div className="stat-card stat-liq">
              <div className="stat-label">TOTAL LIQUIDITY</div>
              <div className="stat-value stat-blue">
                {stats.totalLiquidity >= 1_000_000 ? `$${(stats.totalLiquidity / 1_000_000).toFixed(1)}M` : `$${(stats.totalLiquidity / 1000).toFixed(0)}K`}
              </div>
              <div className="stat-bar stat-bar-blue" style={{ width: '75%' }} />
            </div>
            <div className="stat-card stat-vol">
              <div className="stat-label">24H VOLUME</div>
              <div className="stat-value stat-blue">
                {stats.totalVolume >= 1_000_000 ? `$${(stats.totalVolume / 1_000_000).toFixed(1)}M` : `$${(stats.totalVolume / 1000).toFixed(0)}K`}
              </div>
              <div className="stat-bar stat-bar-blue" style={{ width: '60%' }} />
            </div>
          </div>
        </header>

        {/* Trust strip */}
        <div className="trust-strip">
          {['NON-CUSTODIAL', 'WE NEVER CONTROL YOUR FUNDS', 'ALL TRANSACTIONS IN YOUR WALLET', 'INTELLIGENCE ONLY — NO TRADING'].map((t, i) => (
            <span key={i} className="trust-item">
              <span className="trust-check">✓</span> {t}
            </span>
          ))}
          <button onClick={fetchData} className="refresh-btn">
            ⟳ REFRESH
            {lastUpdated && <span className="refresh-time">{lastUpdated.toLocaleTimeString()}</span>}
          </button>
        </div>

        {/* Search */}
        <IntentSearch value={query} onChange={setQuery} resultCount={filtered.length} />

        {/* Filter tabs */}
        <div className="filter-row">
          <div className="filter-tabs">
            {(['all', 'high', 'medium', 'low'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'active' : ''} tab-${f}`}>
                {f === 'all' ? `ALL (${items.length})` : f === 'high' ? `⬤ HIGH (${stats.high})` : f === 'medium' ? `⬤ MED (${stats.medium})` : `⬤ LOW (${stats.low})`}
              </button>
            ))}
          </div>
          <div className="feed-label">
            <span className="feed-icon">▲</span> WEIRD ACTIVITY FEED
            <span className="feed-count">{filtered.length} SIGNALS DETECTED</span>
          </div>
        </div>

        {/* Feed */}
        <div className="feed">
          {loading ? (
            <div className="loading">
              <div className="loading-bars">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="loading-bar" style={{ animationDelay: `${i * 0.1}s`, height: `${20 + Math.random() * 60}%` }} />
                ))}
              </div>
              <div className="loading-text">SCANNING BASE NETWORK...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◈</div>
              <p>NO SIGNALS MATCH YOUR QUERY</p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <div key={item.id} className="card-wrapper" style={{ animationDelay: `${i * 0.05}s` }}>
                <RadarCard item={item} />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            <span>BASE EARLY SIGNAL RADAR</span>
            <span className="footer-divider">◆</span>
            <span>POWERED BY BASE NETWORK</span>
            <span className="footer-divider">◆</span>
            <span>BUILDER CODE: bc_cpho8un9</span>
          </div>
          <div className="footer-right">NOT FINANCIAL ADVICE. INTELLIGENCE TOOL ONLY.</div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

        :root {
          --bg: #020508;
          --surface: #060d14;
          --surface2: #0a1520;
          --border: rgba(0,200,255,0.08);
          --border-bright: rgba(0,200,255,0.2);
          --blue: #00c8ff;
          --blue-dim: rgba(0,200,255,0.6);
          --red: #ff3b5c;
          --yellow: #ffb800;
          --green: #00e5a0;
          --text: #c8e0f0;
          --text-dim: #4a6a80;
          --text-bright: #e8f4ff;
          --font-mono: 'Space Mono', monospace;
          --font-display: 'Syne', sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .radar-main {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-mono);
          position: relative;
          overflow-x: hidden;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .corner-tl {
          position: fixed;
          top: 0; left: 0;
          width: 300px; height: 300px;
          background: radial-gradient(circle at top left, rgba(0,200,255,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .corner-tr {
          position: fixed;
          top: 0; right: 0;
          width: 400px; height: 400px;
          background: radial-gradient(circle at top right, rgba(255,59,92,0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 60px;
        }

        /* Topbar */
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          font-size: 9px;
          color: var(--text-dim);
          letter-spacing: 0.15em;
          flex-wrap: wrap;
          gap: 8px;
        }
        .topbar-left, .topbar-right { display: flex; align-items: center; gap: 10px; }
        .topbar-divider { color: var(--border-bright); }
        .topbar-item { display: flex; align-items: center; gap: 6px; }
        .live-dot { color: var(--blue); }
        .pulse-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--blue);
          box-shadow: 0 0 8px var(--blue);
          animation: pulse 2s infinite;
          display: inline-block;
        }

        /* Hero */
        .hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 40px;
          padding: 40px 0 32px;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }

        .hero-left { flex: 1; min-width: 280px; }

        .hero-badge {
          display: inline-block;
          font-size: 9px;
          color: var(--blue);
          background: rgba(0,200,255,0.06);
          border: 1px solid rgba(0,200,255,0.2);
          padding: 4px 12px;
          border-radius: 2px;
          letter-spacing: 0.2em;
          margin-bottom: 16px;
          font-family: var(--font-mono);
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 800;
          line-height: 0.95;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .title-base { color: var(--blue); }
        .title-early { color: var(--text-bright); }
        .title-signal {
          color: transparent;
          -webkit-text-stroke: 1px rgba(0,200,255,0.4);
        }

        .hero-sub {
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.05em;
          line-height: 1.6;
          max-width: 400px;
        }

        /* Stats grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          min-width: 320px;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 14px 16px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .stat-card:hover { border-color: var(--border-bright); }

        .stat-label {
          font-size: 8px;
          color: var(--text-dim);
          letter-spacing: 0.15em;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--text-bright);
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-red { color: var(--red); }
        .stat-yellow { color: var(--yellow); }
        .stat-green { color: var(--green); }
        .stat-blue { color: var(--blue); }

        .stat-bar {
          height: 2px;
          background: rgba(255,255,255,0.1);
          border-radius: 1px;
          transition: width 0.8s ease;
        }
        .stat-bar-red { background: var(--red); box-shadow: 0 0 8px var(--red); }
        .stat-bar-yellow { background: var(--yellow); box-shadow: 0 0 8px var(--yellow); }
        .stat-bar-green { background: var(--green); box-shadow: 0 0 8px var(--green); }
        .stat-bar-blue { background: var(--blue); box-shadow: 0 0 8px var(--blue); }

        /* Trust strip */
        .trust-strip {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }

        .trust-item {
          font-size: 9px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .trust-check { color: var(--green); }

        .refresh-btn {
          margin-left: auto;
          padding: 6px 14px;
          background: transparent;
          border: 1px solid var(--border-bright);
          border-radius: 3px;
          color: var(--blue-dim);
          font-size: 9px;
          font-family: var(--font-mono);
          cursor: pointer;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s;
        }
        .refresh-btn:hover { background: rgba(0,200,255,0.06); color: var(--blue); }
        .refresh-time { color: var(--text-dim); font-size: 8px; }

        /* Filter row */
        .filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 0 16px;
          flex-wrap: wrap;
        }

        .filter-tabs { display: flex; gap: 4px; }

        .filter-tab {
          padding: 7px 16px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 3px;
          color: var(--text-dim);
          font-size: 10px;
          font-family: var(--font-mono);
          cursor: pointer;
          letter-spacing: 0.08em;
          font-weight: 700;
          transition: all 0.15s;
        }
        .filter-tab:hover { border-color: var(--border-bright); color: var(--text); }
        .filter-tab.active { background: rgba(0,200,255,0.08); border-color: var(--blue); color: var(--blue); }
        .filter-tab.tab-high.active { background: rgba(255,59,92,0.08); border-color: var(--red); color: var(--red); }
        .filter-tab.tab-medium.active { background: rgba(255,184,0,0.08); border-color: var(--yellow); color: var(--yellow); }
        .filter-tab.tab-low.active { background: rgba(0,229,160,0.08); border-color: var(--green); color: var(--green); }

        .feed-label {
          font-size: 10px;
          color: var(--red);
          letter-spacing: 0.2em;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feed-icon { animation: blink 1s infinite; }
        .feed-count { color: var(--text-dim); font-size: 9px; }

        /* Feed */
        .feed { display: flex; flex-direction: column; gap: 8px; }

        .card-wrapper {
          animation: slideIn 0.3s ease both;
        }

        /* Loading */
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 24px;
        }

        .loading-bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 60px;
        }

        .loading-bar {
          width: 6px;
          background: var(--blue);
          border-radius: 2px;
          animation: barPulse 1.2s ease infinite alternate;
          opacity: 0.6;
        }

        .loading-text {
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.2em;
          animation: pulse 1.5s infinite;
        }

        /* Empty */
        .empty {
          text-align: center;
          padding: 80px 0;
          color: var(--text-dim);
        }
        .empty-icon { font-size: 40px; margin-bottom: 16px; color: var(--border-bright); }
        .empty p { font-size: 11px; letter-spacing: 0.15em; }

        /* Footer */
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 9px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
        }

        .footer-divider { color: var(--border-bright); }
        .footer-right { font-size: 9px; color: var(--text-dim); letter-spacing: 0.08em; }

        /* Animations */
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes barPulse { from { opacity: 0.3; } to { opacity: 1; } }

        /* Search override */
        input::placeholder { color: var(--text-dim) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 2px; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); min-width: unset; }
          .hero { flex-direction: column; }
          .filter-row { flex-direction: column; align-items: flex-start; }
          .topbar-right { display: none; }
        }
      `}</style>
    </main>
  )
}
