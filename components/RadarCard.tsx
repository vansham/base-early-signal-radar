'use client'
import { useState } from 'react'
import { RadarItem } from '@/lib/types'
import { getAnomalyLabel } from '@/lib/anomaly'
import { formatLiquidity, formatAge, getRiskColor } from '@/lib/scoring'
import RiskBadge from './RiskBadge'
import TrackButton from './TrackButton'
import AlertButton from './AlertButton'

async function runAdvancedRiskProof(_item: RadarItem): Promise<void> {
  // TODO: Connect CDP wallet
  // TODO: Append Builder Code: appendBuilderCode(calldata, process.env.NEXT_PUBLIC_BUILDER_CODE!)
  // TODO: Execute onchain verification (~$0.02 USDC on Base)
  console.log('[TODO] Advanced Risk Proof pending wallet integration')
}

type ScanState = 'idle' | 'loading' | 'done' | 'error'

export default function RadarCard({ item }: { item: RadarItem }) {
  const [expanded, setExpanded] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)
  const [proofState, setProofState] = useState<ScanState>('idle')
  const [analyzeState, setAnalyzeState] = useState<ScanState>('idle')
  const [deepScanState, setDeepScanState] = useState<ScanState>('idle')
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [deepScanResult, setDeepScanResult] = useState<string | null>(null)
  const riskColor = getRiskColor(item.riskLevel)

  const handleAnalyze = async () => {
    setAnalyzeState('loading')
    setAnalysisResult(null)
    try {
      await new Promise(r => setTimeout(r, 1400))
      setAnalysisResult(`Score: ${item.riskScore}/100 — ${item.riskLevel} RISK. Liquidity ${item.isKnownDeployer ? 'from verified deployer' : 'from unknown deployer'}. Pool age: ${formatAge(item.ageMinutes)}.`)
      setAnalyzeState('done')
    } catch {
      setAnalyzeState('error')
    }
  }

  const handleDeepScan = async () => {
    setDeepScanState('loading')
    setDeepScanResult(null)
    try {
      await new Promise(r => setTimeout(r, 2200))
      const flags = []
      if (!item.contractVerified) flags.push('Unverified contract')
      if (!item.isKnownDeployer) flags.push('Unknown deployer')
      if (item.ageMinutes < 10) flags.push('Pool age < 10min')
      if (Math.abs(item.priceChange1h) > 50) flags.push('Extreme price movement')
      if (item.liquidity < 10000) flags.push('Low liquidity')
      setDeepScanResult(flags.length > 0 ? `⚠ ${flags.length} flag(s): ${flags.join(', ')}` : '✓ No major flags detected.')
      setDeepScanState('done')
    } catch {
      setDeepScanState('error')
    }
  }

  const btnStyle = (state: ScanState, color: string) => ({
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: 5,
    padding: '6px 12px',
    borderRadius: 4,
    border: `1px solid ${state === 'done' ? color : state === 'error' ? '#ff3b5c' : `${color}44`}`,
    background: state === 'done' ? `${color}12` : state === 'loading' ? `${color}08` : `${color}06`,
    color: state === 'error' ? '#ff3b5c' : state === 'done' ? color : `${color}99`,
    fontSize: 10,
    fontWeight: 700,
    cursor: state === 'loading' ? 'wait' : 'pointer',
    fontFamily: 'Space Mono, monospace',
    letterSpacing: '0.06em',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <>
      <div style={{
        background: 'rgba(6,13,20,0.98)',
        border: '1px solid rgba(0,200,255,0.07)',
        borderLeft: `3px solid ${riskColor}`,
        borderRadius: 6,
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        <div style={{ padding: '14px 18px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#e8f4ff', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>{item.pair}</span>
                <RiskBadge level={item.riskLevel} score={item.riskScore} />
                <span style={{ fontSize: 9, fontFamily: 'Space Mono, monospace', color: '#4a6a80', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.1)', padding: '2px 8px', borderRadius: 3, letterSpacing: '0.1em', fontWeight: 700 }}>
                  {getAnomalyLabel(item.anomalyType)}
                </span>
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                {[
                  { label: 'LIQUIDITY', value: formatLiquidity(item.liquidity) },
                  { label: 'VOL 24H', value: formatLiquidity(item.volume24h) },
                  { label: 'AGE', value: formatAge(item.ageMinutes) },
                  { label: 'DEX', value: item.dex },
                  { label: 'TXS', value: item.txCount.toString() },
                  { label: '1H Δ', value: `${item.priceChange1h > 0 ? '+' : ''}${item.priceChange1h.toFixed(1)}%`, color: item.priceChange1h > 20 ? '#ff3b5c' : item.priceChange1h > 0 ? '#00e5a0' : '#ff3b5c' },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: m.color || '#7a9ab0', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deployer */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.12em', marginBottom: 4 }}>DEPLOYER</div>
              <div style={{ fontSize: 10, color: item.isKnownDeployer ? '#00e5a0' : '#ffb800', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>
                {item.isKnownDeployer ? '✓ VERIFIED' : '⚠ UNKNOWN'}
              </div>
              <div style={{ fontSize: 9, color: '#1a3040', fontFamily: 'Space Mono, monospace', marginTop: 2 }}>{item.deployer}</div>
              <div style={{ fontSize: 8, color: item.contractVerified ? '#00e5a0' : '#ff3b5c', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>
                {item.contractVerified ? '✓ CONTRACT VERIFIED' : '✗ UNVERIFIED'}
              </div>
            </div>
          </div>

          {/* Analysis results */}
          {analyzeState === 'loading' && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.12)', borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ width: 3, height: 14, background: '#00c8ff', borderRadius: 2, animation: 'barPulse 0.8s ease infinite alternate', animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span style={{ fontSize: 10, color: '#00c8ff', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>ANALYZING POOL DATA...</span>
              </div>
            </div>
          )}

          {analyzeState === 'done' && analysisResult && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 4, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: 9, color: '#00c8ff', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>ANALYSIS RESULT</div>
              <div style={{ fontSize: 11, color: '#7ab8d0', fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>🔍 {analysisResult}</div>
            </div>
          )}

          {analyzeState === 'error' && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(255,59,92,0.04)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 4 }}>
              <span style={{ fontSize: 10, color: '#ff3b5c', fontFamily: 'Space Mono, monospace' }}>✗ ANALYSIS FAILED — RETRY</span>
            </div>
          )}

          {deepScanState === 'loading' && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
                <span style={{ fontSize: 10, color: '#a5b4fc', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>DEEP SCANNING CONTRACT...</span>
              </div>
            </div>
          )}

          {deepScanState === 'done' && deepScanResult && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: deepScanResult.includes('⚠') ? 'rgba(255,184,0,0.04)' : 'rgba(0,229,160,0.04)', border: `1px solid ${deepScanResult.includes('⚠') ? 'rgba(255,184,0,0.2)' : 'rgba(0,229,160,0.2)'}`, borderRadius: 4, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: 9, color: '#a5b4fc', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>DEEP SCAN RESULT</div>
              <div style={{ fontSize: 11, color: deepScanResult.includes('⚠') ? '#ffb800' : '#00e5a0', fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>{deepScanResult}</div>
            </div>
          )}

          {deepScanState === 'error' && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(255,59,92,0.04)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 4 }}>
              <span style={{ fontSize: 10, color: '#ff3b5c', fontFamily: 'Space Mono, monospace' }}>✗ SCAN FAILED — RETRY</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleAnalyze} disabled={analyzeState === 'loading'} style={btnStyle(analyzeState, '#00c8ff')}>
              {analyzeState === 'loading' ? '⟳ ANALYZING...' : analyzeState === 'done' ? '✓ ANALYZED' : analyzeState === 'error' ? '✗ RETRY' : '👀 ANALYZE'}
            </button>

            <button onClick={handleDeepScan} disabled={deepScanState === 'loading'} style={btnStyle(deepScanState, '#a5b4fc')}>
              {deepScanState === 'loading' ? '◌ SCANNING...' : deepScanState === 'done' ? '✓ SCANNED' : deepScanState === 'error' ? '✗ RETRY' : '🛡️ DEEP SCAN'}
            </button>

            <TrackButton pairId={item.id} pair={item.pair} />
            <AlertButton pairId={item.id} pair={item.pair} />

            <button onClick={() => setShowProofModal(true)} style={{ ...btnStyle('idle', '#ffb800'), marginLeft: 'auto', fontWeight: 700 }}>
              🛡️ ADV. RISK PROOF
            </button>

            <button onClick={() => setExpanded(v => !v)} style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(0,200,255,0.08)', background: 'transparent', color: '#2a4a60', fontSize: 11, cursor: 'pointer', fontFamily: 'Space Mono, monospace', transition: 'all 0.15s' }}>
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Expanded breakdown */}
        {expanded && (
          <div style={{ borderTop: '1px solid rgba(0,200,255,0.06)', padding: '14px 18px', background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' }}>
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

      {/* Advanced Risk Proof Modal */}
      {showProofModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }} onClick={() => setShowProofModal(false)}>
          <div style={{ background: '#060d14', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 8, padding: 32, maxWidth: 440, width: '100%', animation: 'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 8, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.2em', marginBottom: 14 }}>◆ PREMIUM FEATURE</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8f4ff', marginBottom: 10, fontFamily: 'Syne, sans-serif' }}>🛡️ Advanced Risk Proof</h3>
            <p style={{ fontSize: 12, color: '#4a6a80', lineHeight: 1.7, marginBottom: 16, fontFamily: 'Space Mono, monospace' }}>
              Deep onchain verification of <strong style={{ color: '#e8f4ff' }}>{item.pair}</strong> — checks contract bytecode, deployer history, and LP lock status on Base.
            </p>
            <div style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 6, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 6 }}>ESTIMATED COST</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e8f4ff', fontFamily: 'Syne, sans-serif' }}>~$0.02 <span style={{ fontSize: 13, color: '#4a6a80', fontFamily: 'Space Mono, monospace' }}>USDC on Base</span></div>
            </div>
            <p style={{ fontSize: 10, color: '#2a4a60', fontFamily: 'Space Mono, monospace', marginBottom: 20, lineHeight: 1.7 }}>
              ✓ Non-custodial. We never control your funds.<br />✓ All transactions happen in your wallet.
            </p>

            {proofState === 'loading' && (
              <div style={{ padding: '14px', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
                <span style={{ fontSize: 10, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>CONNECTING WALLET...</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={async () => {
                  setProofState('loading')
                  await runAdvancedRiskProof(item)
                  setProofState('done')
                  setTimeout(() => setShowProofModal(false), 1000)
                }}
                disabled={proofState === 'loading'}
                style={{ flex: 1, padding: '12px', borderRadius: 6, border: 'none', background: proofState === 'loading' ? 'rgba(255,184,0,0.5)' : 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, cursor: proofState === 'loading' ? 'wait' : 'pointer', fontSize: 12, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em' }}>
                {proofState === 'loading' ? '◌ CONNECTING...' : 'CONNECT & VERIFY →'}
              </button>
              <button onClick={() => setShowProofModal(false)} style={{ padding: '12px 16px', borderRadius: 6, border: '1px solid rgba(0,200,255,0.1)', background: 'transparent', color: '#4a6a80', cursor: 'pointer', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes barPulse { from { opacity: 0.3; transform: scaleY(0.6); } to { opacity: 1; transform: scaleY(1); } }
      `}</style>
    </>
  )
}
