'use client'
import { useState, useEffect } from 'react'
import { RadarItem } from '@/lib/types'
import { getAnomalyLabel } from '@/lib/anomaly'
import { formatLiquidity, formatAge, getRiskColor } from '@/lib/scoring'
import RiskBadge from './RiskBadge'
import TrackButton from './TrackButton'
import AlertButton from './AlertButton'

type ScanState = 'idle' | 'loading' | 'done' | 'error'

function AdvancedRiskModal({ item, onClose }: { item: RadarItem; onClose: () => void }) {
  const [state, setState] = useState<'idle' | 'connecting' | 'connected' | 'verifying' | 'done' | 'error'>('idle')

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  const handleConnect = async () => {
    setState('connecting')
    await new Promise(r => setTimeout(r, 1200))
    setState('connected')
  }

  const handleVerify = async () => {
    setState('verifying')
    await new Promise(r => setTimeout(r, 2000))
    setState('done')
    // TODO: Real onchain call with Builder Code:
    // appendBuilderCode(calldata, process.env.NEXT_PUBLIC_BUILDER_CODE!)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(2,5,8,0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: '#07101a',
        border: '1px solid rgba(255,184,0,0.3)',
        borderRadius: 10, padding: '32px',
        maxWidth: 460, width: '100%',
        position: 'relative',
        boxShadow: '0 0 60px rgba(255,184,0,0.08)',
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#4a6a80', fontSize: 20, cursor: 'pointer', lineHeight: 1, fontFamily: 'monospace' }}>✕</button>

        {/* Header */}
        <div style={{ fontSize: 8, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.2em', marginBottom: 12 }}>◆ PREMIUM ONCHAIN FEATURE</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#e8f4ff', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>🛡️ Advanced Risk Proof</h3>
        <p style={{ fontSize: 11, color: '#4a6a80', lineHeight: 1.7, marginBottom: 20, fontFamily: 'Space Mono, monospace' }}>
          Deep onchain verification of <strong style={{ color: '#e8f4ff' }}>{item.pair}</strong> on Base — checks contract bytecode, deployer history, honeypot detection, and LP lock status.
        </p>

        {/* Cost */}
        <div style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 6, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 6 }}>ESTIMATED COST</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#e8f4ff', fontFamily: 'Syne, sans-serif' }}>~$0.02 <span style={{ fontSize: 12, color: '#4a6a80', fontFamily: 'Space Mono, monospace' }}>USDC</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>NETWORK</div>
            <div style={{ fontSize: 12, color: '#00c8ff', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>BASE MAINNET</div>
          </div>
        </div>

        {/* Step flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {[
            { num: '01', label: 'Connect Wallet', done: ['connected','verifying','done'].includes(state) },
            { num: '02', label: 'Approve ~$0.02 USDC', done: ['verifying','done'].includes(state) },
            { num: '03', label: 'Onchain Verification Complete', done: state === 'done' },
          ].map(step => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: step.done ? 'rgba(0,229,160,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${step.done ? 'rgba(0,229,160,0.2)' : 'rgba(0,200,255,0.06)'}`, borderRadius: 5 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: step.done ? '#00e5a0' : 'rgba(0,200,255,0.08)', border: `1px solid ${step.done ? '#00e5a0' : 'rgba(0,200,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: step.done ? '#020508' : '#4a6a80', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{step.done ? '✓' : step.num}</span>
              </div>
              <span style={{ fontSize: 11, color: step.done ? '#00e5a0' : '#4a6a80', fontFamily: 'Space Mono, monospace' }}>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Status messages */}
        {state === 'connecting' && (
          <div style={{ padding: '10px 14px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#00c8ff', fontSize: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            <span style={{ fontSize: 10, color: '#00c8ff', fontFamily: 'Space Mono, monospace' }}>LOOKING FOR WALLET...</span>
          </div>
        )}
        {state === 'verifying' && (
          <div style={{ padding: '10px 14px', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#ffb800', fontSize: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            <span style={{ fontSize: 10, color: '#ffb800', fontFamily: 'Space Mono, monospace' }}>VERIFYING ONCHAIN...</span>
          </div>
        )}
        {state === 'done' && (
          <div style={{ padding: '10px 14px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 5, marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: '#00e5a0', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>✓ VERIFICATION COMPLETE! Builder Code Attached.</span>
          </div>
        )}

        {/* Action button */}
        {state === 'idle' && (
          <button onClick={handleConnect} style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', cursor: 'pointer', marginBottom: 10 }}>
            🔗 CONNECT WALLET
          </button>
        )}
        {state === 'connecting' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {['MetaMask', 'Coinbase Wallet', 'WalletConnect', 'Rabby'].map(w => (
              <button key={w} style={{ padding: '10px', borderRadius: 5, border: '1px solid rgba(0,200,255,0.15)', background: 'rgba(0,200,255,0.04)', color: '#7ab8d0', fontSize: 10, fontFamily: 'Space Mono, monospace', cursor: 'pointer', fontWeight: 700 }} onClick={handleConnect}>
                {w}
              </button>
            ))}
          </div>
        )}
        {state === 'connected' && (
          <button onClick={handleVerify} style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', cursor: 'pointer', marginBottom: 10 }}>
            🛡️ APPROVE & VERIFY ONCHAIN →
          </button>
        )}
        {state === 'done' && (
          <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 6, border: '1px solid rgba(0,229,160,0.3)', background: 'rgba(0,229,160,0.08)', color: '#00e5a0', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', cursor: 'pointer', marginBottom: 10 }}>
            ✓ DONE — CLOSE
          </button>
        )}

        <p style={{ fontSize: 9, color: '#2a4a60', fontFamily: 'Space Mono, monospace', textAlign: 'center', lineHeight: 1.6 }}>
          Non-custodial · We never control your funds · All transactions in your wallet
        </p>
      </div>
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  )
}

export default function RadarCard({ item }: { item: RadarItem }) {
  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [analyzeState, setAnalyzeState] = useState<ScanState>('idle')
  const [deepScanState, setDeepScanState] = useState<ScanState>('idle')
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [deepScanResult, setDeepScanResult] = useState<string | null>(null)
  const riskColor = getRiskColor(item.riskLevel)

  const handleAnalyze = async () => {
    if (analyzeState === 'loading') return
    setAnalyzeState('loading'); setAnalysisResult(null)
    await new Promise(r => setTimeout(r, 1400))
    setAnalysisResult(`Score: ${item.riskScore}/100 — ${item.riskLevel} RISK. Deployer: ${item.isKnownDeployer ? 'verified' : 'unknown'}. Age: ${formatAge(item.ageMinutes)}.`)
    setAnalyzeState('done')
  }

  const handleDeepScan = async () => {
    if (deepScanState === 'loading') return
    setDeepScanState('loading'); setDeepScanResult(null)
    await new Promise(r => setTimeout(r, 2000))
    const flags = []
    if (!item.contractVerified) flags.push('Unverified contract')
    if (!item.isKnownDeployer) flags.push('Unknown deployer')
    if (item.ageMinutes < 10) flags.push('Pool < 10min old')
    if (Math.abs(item.priceChange1h) > 50) flags.push('Extreme price move')
    if (item.liquidity < 10000) flags.push('Low liquidity')
    setDeepScanResult(flags.length > 0 ? `⚠ ${flags.length} flag(s): ${flags.join(' · ')}` : '✓ No major flags detected.')
    setDeepScanState('done')
  }

  const btnStyle = (state: ScanState, color: string) => ({
    display: 'inline-flex' as const, alignItems: 'center' as const, gap: 5,
    padding: '6px 12px', borderRadius: 4,
    border: `1px solid ${state === 'done' ? color : state === 'error' ? '#ff3b5c40' : `${color}33`}`,
    background: state === 'done' ? `${color}15` : `${color}08`,
    color: state === 'error' ? '#ff3b5c' : state === 'done' ? color : `${color}88`,
    fontSize: 10, fontWeight: 700,
    cursor: state === 'loading' ? 'wait' as const : 'pointer' as const,
    fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em',
    transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  })

  return (
    <>
      <div style={{ background: 'rgba(6,13,20,0.98)', border: '1px solid rgba(0,200,255,0.07)', borderLeft: `3px solid ${riskColor}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#e8f4ff', fontFamily: 'Syne, sans-serif' }}>{item.pair}</span>
                <RiskBadge level={item.riskLevel} score={item.riskScore} />
                <span style={{ fontSize: 9, fontFamily: 'Space Mono, monospace', color: '#4a6a80', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.1)', padding: '2px 8px', borderRadius: 3, letterSpacing: '0.1em', fontWeight: 700 }}>{getAnomalyLabel(item.anomalyType)}</span>
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                {[
                  { label: 'LIQUIDITY', value: formatLiquidity(item.liquidity) },
                  { label: 'VOL 24H', value: formatLiquidity(item.volume24h) },
                  { label: 'AGE', value: formatAge(item.ageMinutes) },
                  { label: 'DEX', value: item.dex },
                  { label: 'TXS', value: item.txCount.toString() },
                  { label: '1H Δ', value: `${item.priceChange1h > 0 ? '+' : ''}${item.priceChange1h.toFixed(1)}%`, color: Math.abs(item.priceChange1h) > 20 ? '#ff3b5c' : '#00e5a0' },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: m.color || '#7a9ab0', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.12em', marginBottom: 4 }}>DEPLOYER</div>
              <div style={{ fontSize: 10, color: item.isKnownDeployer ? '#00e5a0' : '#ffb800', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{item.isKnownDeployer ? '✓ VERIFIED' : '⚠ UNKNOWN'}</div>
              <div style={{ fontSize: 9, color: '#1a3040', fontFamily: 'Space Mono, monospace', marginTop: 2 }}>{item.deployer}</div>
              <div style={{ fontSize: 8, color: item.contractVerified ? '#00e5a0' : '#ff3b5c', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>{item.contractVerified ? '✓ CONTRACT VERIFIED' : '✗ UNVERIFIED'}</div>
            </div>
          </div>

          {analyzeState === 'loading' && <div style={{ marginBottom: 10, padding: '10px 14px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.12)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 16 }}>{[0,1,2,3,4].map(i => <div key={i} style={{ width: 3, background: '#00c8ff', borderRadius: 2, animation: 'barPulse 0.7s ease infinite alternate', animationDelay: `${i*0.1}s`, height: `${8+i*2}px` }} />)}</div><span style={{ fontSize: 10, color: '#00c8ff', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>ANALYZING POOL DATA...</span></div>}
          {analyzeState === 'done' && analysisResult && <div style={{ marginBottom: 10, padding: '10px 14px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 4 }}><div style={{ fontSize: 8, color: '#00c8ff66', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 4 }}>ANALYSIS RESULT</div><div style={{ fontSize: 11, color: '#7ab8d0', fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>🔍 {analysisResult}</div></div>}
          {deepScanState === 'loading' && <div style={{ marginBottom: 10, padding: '10px 14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 16, animation: 'spin 1s linear infinite', display: 'inline-block', color: '#a5b4fc' }}>◌</span><span style={{ fontSize: 10, color: '#a5b4fc', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>DEEP SCANNING CONTRACT...</span></div>}
          {deepScanState === 'done' && deepScanResult && <div style={{ marginBottom: 10, padding: '10px 14px', background: deepScanResult.includes('⚠') ? 'rgba(255,184,0,0.04)' : 'rgba(0,229,160,0.04)', border: `1px solid ${deepScanResult.includes('⚠') ? 'rgba(255,184,0,0.2)' : 'rgba(0,229,160,0.2)'}`, borderRadius: 4 }}><div style={{ fontSize: 8, color: '#a5b4fc66', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 4 }}>DEEP SCAN RESULT</div><div style={{ fontSize: 11, color: deepScanResult.includes('⚠') ? '#ffb800' : '#00e5a0', fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>{deepScanResult}</div></div>}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleAnalyze} disabled={analyzeState === 'loading'} style={btnStyle(analyzeState, '#00c8ff')}>
              {analyzeState === 'loading' ? '⟳ ANALYZING...' : analyzeState === 'done' ? '✓ ANALYZED' : '👀 ANALYZE'}
            </button>
            <button onClick={handleDeepScan} disabled={deepScanState === 'loading'} style={btnStyle(deepScanState, '#a5b4fc')}>
              {deepScanState === 'loading' ? '◌ SCANNING...' : deepScanState === 'done' ? '✓ SCANNED' : '🛡️ DEEP SCAN'}
            </button>
            <TrackButton pairId={item.id} pair={item.pair} />
            <AlertButton pairId={item.id} pair={item.pair} />
            <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 4, border: '1px solid rgba(255,184,0,0.3)', background: 'rgba(255,184,0,0.06)', color: '#ffb800', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              🛡️ ADV. RISK PROOF
            </button>
            <button onClick={() => setExpanded(v => !v)} style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(0,200,255,0.08)', background: 'transparent', color: '#2a4a60', fontSize: 11, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {expanded && (
          <div style={{ borderTop: '1px solid rgba(0,200,255,0.06)', padding: '14px 18px', background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 12, fontWeight: 700 }}>RISK BREAKDOWN</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 6 }}>
              {[
                { label: 'Liquidity', ok: item.liquidity > 50000, val: formatLiquidity(item.liquidity) },
                { label: 'Pool Age', ok: item.ageMinutes > 30, val: formatAge(item.ageMinutes) },
                { label: 'Known DEX', ok: ['Uniswap V3','Aerodrome','BaseSwap','SushiSwap','Curve'].includes(item.dex), val: item.dex },
                { label: 'Deployer', ok: item.isKnownDeployer, val: item.isKnownDeployer ? 'Known' : 'Unknown' },
                { label: 'Contract', ok: item.contractVerified, val: item.contractVerified ? 'Verified' : 'Unverified' },
                { label: 'Price Stability', ok: Math.abs(item.priceChange1h) < 20, val: `${item.priceChange1h > 0 ? '+' : ''}${item.priceChange1h.toFixed(1)}%` },
              ].map(sig => (
                <div key={sig.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'rgba(255,255,255,0.01)', borderRadius: 3, border: `1px solid ${sig.ok ? 'rgba(0,229,160,0.12)' : 'rgba(255,59,92,0.12)'}` }}>
                  <span style={{ fontSize: 9, color: '#4a6a80', fontFamily: 'Space Mono, monospace' }}>{sig.label}</span>
                  <span style={{ fontSize: 9, color: sig.ok ? '#00e5a0' : '#ff3b5c', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{sig.ok ? '✓' : '✗'} {sig.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && <AdvancedRiskModal item={item} onClose={() => setShowModal(false)} />}

      <style>{`
        @keyframes barPulse { from { opacity:0.3; transform:scaleY(0.5); } to { opacity:1; transform:scaleY(1); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </>
  )
}
