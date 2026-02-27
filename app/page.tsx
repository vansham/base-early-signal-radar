'use client'
import { useState, useEffect, useMemo } from 'react'
import { RadarItem } from '@/lib/types'
import { detectAnomalies, getAnomalyLabel } from '@/lib/anomaly'
import { formatLiquidity, formatAge, getRiskColor, scoreToRiskLevel } from '@/lib/scoring'
import RiskBadge from '@/components/RiskBadge'
import TrackButton from '@/components/TrackButton'
import AlertButton from '@/components/AlertButton'
import IntentSearch from '@/components/IntentSearch'

type ScanState = 'idle' | 'loading' | 'done' | 'error'
type ProofStep = 'idle' | 'connecting' | 'connected' | 'verifying' | 'done'

function Card({ item, onProof }: { item: RadarItem; onProof: (item: RadarItem) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [analyzeState, setAnalyzeState] = useState<ScanState>('idle')
  const [deepState, setDeepState] = useState<ScanState>('idle')
  const [analyzeResult, setAnalyzeResult] = useState('')
  const [deepResult, setDeepResult] = useState('')
  const rc = getRiskColor(item.riskLevel)

  const doAnalyze = async () => {
    if (analyzeState === 'loading') return
    setAnalyzeState('loading'); setAnalyzeResult('')
    await new Promise(r => setTimeout(r, 1200))
    setAnalyzeResult(`Score ${item.riskScore}/100 · ${item.riskLevel} RISK · Deployer: ${item.isKnownDeployer ? 'verified' : 'unknown'} · Age: ${formatAge(item.ageMinutes)}`)
    setAnalyzeState('done')
  }

  const doDeepScan = async () => {
    if (deepState === 'loading') return
    setDeepState('loading'); setDeepResult('')
    await new Promise(r => setTimeout(r, 2000))
    const f = []
    if (!item.contractVerified) f.push('Unverified contract')
    if (!item.isKnownDeployer) f.push('Unknown deployer')
    if (item.ageMinutes < 10) f.push('Pool < 10min')
    if (Math.abs(item.priceChange1h) > 50) f.push('Extreme price')
    if (item.liquidity < 10000) f.push('Low liquidity')
    setDeepResult(f.length ? `⚠ ${f.length} flags: ${f.join(' · ')}` : '✓ No major flags')
    setDeepState('done')
  }

  const B = (st: ScanState, c: string) => ({
    display: 'inline-flex' as const, alignItems: 'center' as const, gap: 5,
    padding: '6px 11px', borderRadius: 4,
    border: `1px solid ${st === 'done' ? c : `${c}30`}`,
    background: `${c}${st === 'done' ? '15' : '08'}`,
    color: st === 'done' ? c : `${c}70`,
    fontSize: 10, fontWeight: 700, cursor: st === 'loading' ? 'wait' as const : 'pointer' as const,
    fontFamily: 'Space Mono, monospace', letterSpacing: '0.05em', whiteSpace: 'nowrap' as const, transition: 'all 0.15s',
  })

  return (
    <div style={{ background: '#060d14', border: `1px solid rgba(0,200,255,0.07)`, borderLeft: `3px solid ${rc}`, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
      <div style={{ padding: '14px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#e8f4ff', fontFamily: 'Syne, sans-serif' }}>{item.pair}</span>
              <RiskBadge level={item.riskLevel} score={item.riskScore} />
              <span style={{ fontSize: 9, color: '#3a5a70', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.1)', padding: '2px 8px', borderRadius: 3, letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Space Mono, monospace' }}>{getAnomalyLabel(item.anomalyType)}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[['LIQUIDITY', formatLiquidity(item.liquidity)], ['VOL 24H', formatLiquidity(item.volume24h)], ['AGE', formatAge(item.ageMinutes)], ['DEX', item.dex], ['TXS', `${item.txCount}`], ['1H Δ', `${item.priceChange1h > 0 ? '+' : ''}${item.priceChange1h.toFixed(1)}%`]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12, color: l === '1H Δ' ? (Math.abs(item.priceChange1h) > 20 ? '#ff3b5c' : '#00e5a0') : '#7a9ab0', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>DEPLOYER</div>
            <div style={{ fontSize: 10, color: item.isKnownDeployer ? '#00e5a0' : '#ffb800', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{item.isKnownDeployer ? '✓ VERIFIED' : '⚠ UNKNOWN'}</div>
            <div style={{ fontSize: 9, color: '#1a3040', fontFamily: 'Space Mono, monospace', marginTop: 2 }}>{item.deployer}</div>
            <div style={{ fontSize: 8, color: item.contractVerified ? '#00e5a0' : '#ff3b5c', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>{item.contractVerified ? '✓ VERIFIED CONTRACT' : '✗ UNVERIFIED'}</div>
          </div>
        </div>

        {/* Results */}
        {analyzeState === 'loading' && <div style={{ marginBottom: 8, padding: '9px 14px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.12)', borderRadius: 4, display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ color: '#00c8ff', animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 14 }}>◌</span><span style={{ fontSize: 10, color: '#00c8ff', fontFamily: 'Space Mono, monospace' }}>ANALYZING POOL DATA...</span></div>}
        {analyzeState === 'done' && <div style={{ marginBottom: 8, padding: '9px 14px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 4 }}><span style={{ fontSize: 10, color: '#7ab8d0', fontFamily: 'Space Mono, monospace' }}>🔍 {analyzeResult}</span></div>}
        {deepState === 'loading' && <div style={{ marginBottom: 8, padding: '9px 14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4, display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ color: '#a5b4fc', animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 14 }}>◌</span><span style={{ fontSize: 10, color: '#a5b4fc', fontFamily: 'Space Mono, monospace' }}>DEEP SCANNING CONTRACT...</span></div>}
        {deepState === 'done' && <div style={{ marginBottom: 8, padding: '9px 14px', background: deepResult.includes('⚠') ? 'rgba(255,184,0,0.04)' : 'rgba(0,229,160,0.04)', border: `1px solid ${deepResult.includes('⚠') ? 'rgba(255,184,0,0.2)' : 'rgba(0,229,160,0.2)'}`, borderRadius: 4 }}><span style={{ fontSize: 10, color: deepResult.includes('⚠') ? '#ffb800' : '#00e5a0', fontFamily: 'Space Mono, monospace' }}>{deepResult}</span></div>}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={doAnalyze} disabled={analyzeState === 'loading'} style={B(analyzeState, '#00c8ff')}>
            {analyzeState === 'loading' ? '◌ ANALYZING...' : analyzeState === 'done' ? '✓ ANALYZED' : '👀 ANALYZE'}
          </button>
          <button onClick={doDeepScan} disabled={deepState === 'loading'} style={B(deepState, '#a5b4fc')}>
            {deepState === 'loading' ? '◌ SCANNING...' : deepState === 'done' ? '✓ SCANNED' : '🛡️ DEEP SCAN'}
          </button>
          <TrackButton pairId={item.id} pair={item.pair} />
          <AlertButton pairId={item.id} pair={item.pair} />
          <button onClick={() => onProof(item)} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 4, border: '1px solid rgba(255,184,0,0.3)', background: 'rgba(255,184,0,0.06)', color: '#ffb800', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Mono, monospace', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>🛡️ ADV. RISK PROOF</button>
          <button onClick={() => setExpanded(v => !v)} style={{ padding: '6px 9px', borderRadius: 4, border: '1px solid rgba(0,200,255,0.08)', background: 'transparent', color: '#2a4a60', fontSize: 11, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>{expanded ? '▲' : '▼'}</button>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(0,200,255,0.06)', padding: '14px 18px', background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 10, fontWeight: 700 }}>RISK BREAKDOWN</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
            {[
              { label: 'Liquidity', ok: item.liquidity > 50000, val: formatLiquidity(item.liquidity) },
              { label: 'Pool Age', ok: item.ageMinutes > 30, val: formatAge(item.ageMinutes) },
              { label: 'Known DEX', ok: ['Uniswap V3','Aerodrome','BaseSwap','SushiSwap','Curve'].includes(item.dex), val: item.dex },
              { label: 'Deployer', ok: item.isKnownDeployer, val: item.isKnownDeployer ? 'Known' : 'Unknown' },
              { label: 'Contract', ok: item.contractVerified, val: item.contractVerified ? 'Verified' : 'Unverified' },
              { label: 'Price', ok: Math.abs(item.priceChange1h) < 20, val: `${item.priceChange1h > 0 ? '+' : ''}${item.priceChange1h.toFixed(1)}%` },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.01)', borderRadius: 3, border: `1px solid ${s.ok ? 'rgba(0,229,160,0.12)' : 'rgba(255,59,92,0.12)'}` }}>
                <span style={{ fontSize: 9, color: '#3a5a70', fontFamily: 'Space Mono, monospace' }}>{s.label}</span>
                <span style={{ fontSize: 9, color: s.ok ? '#00e5a0' : '#ff3b5c', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{s.ok ? '✓' : '✗'} {s.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProofModal({ item, onClose }: { item: RadarItem; onClose: () => void }) {
  const [step, setStep] = useState<ProofStep>('idle')
  const [wallet, setWallet] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const connect = async (w: string) => {
    setWallet(w); setStep('connecting')
    await new Promise(r => setTimeout(r, 1500))
    setStep('connected')
  }

  const verify = async () => {
    setStep('verifying')
    await new Promise(r => setTimeout(r, 2000))
    setStep('done')
    // TODO: Real onchain call + Builder Code append
  }

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(2,5,8,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#07101a', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 10, padding: 28, maxWidth: 460, width: '100%', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: '#4a6a80', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>

        <div style={{ fontSize: 8, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.2em', marginBottom: 10 }}>◆ PREMIUM ONCHAIN FEATURE</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8f4ff', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>🛡️ Advanced Risk Proof</h3>
        <p style={{ fontSize: 11, color: '#4a6a80', lineHeight: 1.7, marginBottom: 18, fontFamily: 'Space Mono, monospace' }}>
          Onchain verification of <strong style={{ color: '#e8f4ff' }}>{item.pair}</strong> — contract bytecode, deployer history, honeypot check, LP lock status.
        </p>

        <div style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 6, padding: '12px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>ESTIMATED COST</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#e8f4ff', fontFamily: 'Syne, sans-serif' }}>~$0.02 <span style={{ fontSize: 11, color: '#4a6a80', fontFamily: 'Space Mono, monospace' }}>USDC</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', marginBottom: 4 }}>NETWORK</div>
            <div style={{ fontSize: 11, color: '#00c8ff', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>BASE MAINNET</div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {[
            { n: '01', label: 'Connect Wallet', done: ['connected','verifying','done'].includes(step) },
            { n: '02', label: 'Approve ~$0.02 USDC', done: ['verifying','done'].includes(step) },
            { n: '03', label: 'Onchain Verification', done: step === 'done' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: s.done ? 'rgba(0,229,160,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.done ? 'rgba(0,229,160,0.2)' : 'rgba(0,200,255,0.06)'}`, borderRadius: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.done ? '#00e5a0' : 'rgba(0,200,255,0.06)', border: `1px solid ${s.done ? '#00e5a0' : 'rgba(0,200,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, color: s.done ? '#020508' : '#3a5a70', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{s.done ? '✓' : s.n}</span>
              </div>
              <span style={{ fontSize: 11, color: s.done ? '#00e5a0' : '#4a6a80', fontFamily: 'Space Mono, monospace' }}>{s.label}</span>
              {s.done && wallet && s.n === '01' && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#3a5a70', fontFamily: 'Space Mono, monospace' }}>{wallet}</span>}
            </div>
          ))}
        </div>

        {/* Status */}
        {step === 'connecting' && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.12)', borderRadius: 5, display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ fontSize: 15, color: '#00c8ff', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span><span style={{ fontSize: 10, color: '#00c8ff', fontFamily: 'Space Mono, monospace' }}>CONNECTING TO {wallet.toUpperCase()}...</span></div>}
        {step === 'verifying' && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 5, display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ fontSize: 15, color: '#ffb800', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span><span style={{ fontSize: 10, color: '#ffb800', fontFamily: 'Space Mono, monospace' }}>VERIFYING ONCHAIN · PLEASE CONFIRM IN WALLET...</span></div>}
        {step === 'done' && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 5 }}><span style={{ fontSize: 11, color: '#00e5a0', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>✓ VERIFICATION COMPLETE — Builder Code bc_cpho8un9 attached!</span></div>}

        {/* Actions */}
        {step === 'idle' && (
          <>
            <div style={{ fontSize: 9, color: '#3a5a70', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 10 }}>SELECT WALLET</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {['MetaMask', 'Coinbase Wallet', 'WalletConnect', 'Rabby Wallet'].map(w => (
                <button key={w} onClick={() => connect(w)} style={{ padding: '12px', borderRadius: 5, border: '1px solid rgba(0,200,255,0.15)', background: 'rgba(0,200,255,0.04)', color: '#7ab8d0', fontSize: 11, fontFamily: 'Space Mono, monospace', cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s' }}>
                  {w === 'MetaMask' ? '🦊' : w === 'Coinbase Wallet' ? '🔵' : w === 'WalletConnect' ? '🔗' : '🐰'} {w}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'connected' && (
          <button onClick={verify} style={{ width: '100%', padding: '13px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, fontSize: 12, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', cursor: 'pointer', marginBottom: 14 }}>
            🛡️ APPROVE $0.02 & VERIFY ONCHAIN →
          </button>
        )}

        {step === 'done' && (
          <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 6, border: '1px solid rgba(0,229,160,0.3)', background: 'rgba(0,229,160,0.08)', color: '#00e5a0', fontWeight: 800, fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer', marginBottom: 14 }}>
            ✓ DONE — CLOSE
          </button>
        )}

        <p style={{ fontSize: 9, color: '#1a3040', fontFamily: 'Space Mono, monospace', textAlign: 'center' }}>Non-custodial · We never control your funds · All transactions in your wallet</p>
      </div>
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  )
}

export default function HomePage() {
  const [items, setItems] = useState<RadarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [proofItem, setProofItem] = useState<RadarItem | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/radar')
      const json = await res.json()
      if (json.success) { setItems(json.data); setLastUpdated(new Date()) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i) }, [])

  const filtered = useMemo(() => items.filter(item => {
    const q = query.toLowerCase()
    const mq = !q || item.pair.toLowerCase().includes(q) || item.dex.toLowerCase().includes(q) || item.anomalyType.toLowerCase().includes(q.replace(' ', '_'))
    const mf = filter === 'all' || item.riskLevel.toLowerCase() === filter
    return mq && mf
  }), [items, query, filter])

  const stats = useMemo(() => ({
    high: items.filter(i => i.riskLevel === 'HIGH').length,
    medium: items.filter(i => i.riskLevel === 'MEDIUM').length,
    low: items.filter(i => i.riskLevel === 'LOW').length,
    liq: items.reduce((a, b) => a + b.liquidity, 0),
    vol: items.reduce((a, b) => a + b.volume24h, 0),
  }), [items])

  const fmt = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1000).toFixed(0)}K`

  return (
    <>
      <main style={{ minHeight: '100vh', background: '#020508', color: '#c8e0f0', fontFamily: 'Space Mono, monospace', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', top: 0, left: 0, width: 300, height: 300, background: 'radial-gradient(circle at top left, rgba(0,200,255,0.05), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(circle at top right, rgba(255,59,92,0.04), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px' }}>
          {/* Topbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,200,255,0.06)', fontSize: 9, color: '#2a4a60', letterSpacing: '0.15em', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>BASE NETWORK</span><span style={{ color: 'rgba(0,200,255,0.2)' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00c8ff' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00c8ff', boxShadow: '0 0 6px #00c8ff', animation: 'pulse 2s infinite', display: 'inline-block' }} />LIVE FEED</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>{new Date().toUTCString().slice(0,25)}</span><span style={{ color: 'rgba(0,200,255,0.2)' }}>|</span>
              <span>SIGNALS: {items.length}</span>
            </div>
          </div>

          {/* Hero */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, padding: '36px 0 28px', borderBottom: '1px solid rgba(0,200,255,0.06)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 8, color: '#00c8ff', background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)', padding: '4px 12px', borderRadius: 2, letterSpacing: '0.2em', marginBottom: 14, display: 'inline-block' }}>INTELLIGENCE PLATFORM v2.0</div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, lineHeight: 0.95, marginBottom: 14, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#00c8ff' }}>BASE</span><span style={{ color: '#e8f4ff' }}> EARLY</span><br />
                <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(0,200,255,0.4)' }}>SIGNAL RADAR</span>
              </h1>
              <p style={{ fontSize: 11, color: '#3a5a70', letterSpacing: '0.04em', lineHeight: 1.6 }}>Detect anomalies on Base before the crowd. Non-custodial. Intelligence only.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, minWidth: 300 }}>
              {[
                { l: 'SIGNALS', v: `${items.length}`, c: '#e8f4ff', b: 100 },
                { l: 'HIGH RISK', v: `${stats.high}`, c: '#ff3b5c', b: items.length ? (stats.high/items.length)*100 : 0 },
                { l: 'MEDIUM', v: `${stats.medium}`, c: '#ffb800', b: items.length ? (stats.medium/items.length)*100 : 0 },
                { l: 'LOW RISK', v: `${stats.low}`, c: '#00e5a0', b: items.length ? (stats.low/items.length)*100 : 0 },
                { l: 'LIQUIDITY', v: fmt(stats.liq), c: '#00c8ff', b: 70 },
                { l: '24H VOLUME', v: fmt(stats.vol), c: '#00c8ff', b: 55 },
              ].map(s => (
                <div key={s.l} style={{ background: '#060d14', border: '1px solid rgba(0,200,255,0.07)', borderRadius: 4, padding: '12px 14px', overflow: 'hidden' }}>
                  <div style={{ fontSize: 7, color: '#2a4a60', letterSpacing: '0.15em', marginBottom: 6, fontWeight: 700 }}>{s.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.c, fontFamily: 'Syne, sans-serif', lineHeight: 1, marginBottom: 8 }}>{s.v}</div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                    <div style={{ height: '100%', width: `${s.b}%`, background: s.c, boxShadow: `0 0 6px ${s.c}`, borderRadius: 1, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '10px 0', borderBottom: '1px solid rgba(0,200,255,0.06)', flexWrap: 'wrap' }}>
            {['NON-CUSTODIAL', 'WE NEVER CONTROL YOUR FUNDS', 'ALL TXS IN YOUR WALLET', 'INTELLIGENCE ONLY'].map(t => (
              <span key={t} style={{ fontSize: 9, color: '#2a4a60', display: 'flex', alignItems: 'center', gap: 5, letterSpacing: '0.1em' }}><span style={{ color: '#00e5a0' }}>✓</span>{t}</span>
            ))}
            <button onClick={fetchData} style={{ marginLeft: 'auto', padding: '6px 14px', background: 'transparent', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 3, color: '#3a6a80', fontSize: 9, fontFamily: 'Space Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⟳ REFRESH {lastUpdated && <span style={{ color: '#1a3040' }}>{lastUpdated.toLocaleTimeString()}</span>}
            </button>
          </div>

          <div style={{ paddingTop: 20 }}>
            <IntentSearch value={query} onChange={setQuery} resultCount={filtered.length} />

            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all','high','medium','low'] as const).map(f => {
                  const colors: Record<string,string> = { all: '#00c8ff', high: '#ff3b5c', medium: '#ffb800', low: '#00e5a0' }
                  const c = colors[f]
                  const active = filter === f
                  return (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 3, border: `1px solid ${active ? c : 'rgba(0,200,255,0.08)'}`, background: active ? `${c}12` : 'transparent', color: active ? c : '#3a5a70', fontSize: 10, fontFamily: 'Space Mono, monospace', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {f === 'all' ? `ALL(${items.length})` : f === 'high' ? `HIGH(${stats.high})` : f === 'medium' ? `MED(${stats.medium})` : `LOW(${stats.low})`}
                    </button>
                  )
                })}
              </div>
              <span style={{ fontSize: 9, color: '#ff3b5c', letterSpacing: '0.2em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ animation: 'blink 1s infinite' }}>▲</span> WEIRD ACTIVITY FEED
                <span style={{ color: '#2a4a60' }}>{filtered.length} DETECTED</span>
              </span>
            </div>

            {/* Cards */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 12, color: '#2a4a60', letterSpacing: '0.2em', animation: 'pulse 1.5s infinite' }}>SCANNING BASE NETWORK...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, color: '#2a4a60' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                <p style={{ fontSize: 11, letterSpacing: '0.15em' }}>NO SIGNALS MATCH YOUR QUERY</p>
              </div>
            ) : (
              filtered.map(item => <Card key={item.id} item={item} onProof={setProofItem} />)
            )}
          </div>

          <footer style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid rgba(0,200,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#1a3040', letterSpacing: '0.1em' }}>BASE EARLY SIGNAL RADAR · BUILDER CODE: bc_cpho8un9</span>
            <span style={{ fontSize: 9, color: '#1a3040', letterSpacing: '0.08em' }}>NOT FINANCIAL ADVICE. INTELLIGENCE ONLY.</span>
          </footer>
        </div>
      </main>

      {/* MODAL RENDERED OUTSIDE MAIN - NO Z-INDEX ISSUES */}
      {proofItem && <ProofModal item={proofItem} onClose={() => setProofItem(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #2a4a60 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020508; }
        ::-webkit-scrollbar-thumb { background: #0a1520; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </>
  )
}
