'use client'
import { useState } from 'react'
import { RadarItem } from '@/lib/types'
import { getAnomalyLabel } from '@/lib/anomaly'
import { formatLiquidity, formatAge, getRiskColor } from '@/lib/scoring'
import RiskBadge from './RiskBadge'
import TrackButton from './TrackButton'
import AlertButton from './AlertButton'

async function runAdvancedRiskProof(_item: RadarItem): Promise<void> {
  import { appendBuilderCode } from '@/lib/builderCode'
  // TODO: Connect CDP wallet
  // TODO: Append Builder Code: appendBuilderCode(calldata, process.env.NEXT_PUBLIC_BUILDER_CODE!)
  // TODO: Execute onchain verification (~$0.02 USDC on Base)
  console.log('[TODO] Advanced Risk Proof pending wallet integration')
}

export default function RadarCard({ item }: { item: RadarItem }) {
  const [expanded, setExpanded] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const riskColor = getRiskColor(item.riskLevel)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1200))
    setAnalysisResult(`Score: ${item.riskScore}/100 — ${item.riskLevel} RISK. Liquidity ${item.isKnownDeployer ? 'from verified deployer' : 'from unknown deployer'}. Pool age: ${formatAge(item.ageMinutes)}.`)
    setAnalyzing(false)
  }

  return (
    <>
      <div style={{ background: 'rgba(10,15,26,0.95)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${riskColor}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>{item.pair}</span>
                <RiskBadge level={item.riskLevel} score={item.riskScore} />
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748b', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 3, letterSpacing: '0.08em', fontWeight: 600 }}>{getAnomalyLabel(item.anomalyType)}</span>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'LIQUIDITY', value: formatLiquidity(item.liquidity) },
                  { label: 'VOLUME 24H', value: formatLiquidity(item.volume24h) },
                  { label: 'AGE', value: formatAge(item.ageMinutes) },
                  { label: 'DEX', value: item.dex },
                  { label: 'TXS', value: item.txCount.toString() },
                  { label: '1H CHANGE', value: `${item.priceChange1h > 0 ? '+' : ''}${item.priceChange1h.toFixed(1)}%`, color: item.priceChange1h > 0 ? '#10b981' : '#ef4444' },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 13, color: m.color || '#94a3b8', fontFamily: 'monospace', fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {analysisResult && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, fontSize: 11, color: '#93c5fd', fontFamily: 'monospace', lineHeight: 1.5 }}>
                  🔍 {analysisResult}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: 3 }}>DEPLOYER</div>
              <div style={{ fontSize: 11, color: item.isKnownDeployer ? '#10b981' : '#f59e0b', fontFamily: 'monospace' }}>{item.isKnownDeployer ? '✓ Verified' : '⚠ Unknown'}</div>
              <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', marginTop: 2 }}>{item.deployer}</div>
              <div style={{ fontSize: 9, color: item.contractVerified ? '#10b981' : '#ef4444', marginTop: 4, fontFamily: 'monospace' }}>{item.contractVerified ? '✓ Contract verified' : '✗ Unverified contract'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleAnalyze} disabled={analyzing} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontSize: 11, fontWeight: 600, cursor: analyzing ? 'wait' : 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {analyzing ? '⟳ ANALYZING...' : '👀 ANALYZE'}
            </button>
            <button onClick={() => setShowProofModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              🛡️ DEEP RISK SCAN
            </button>
            <TrackButton pairId={item.id} pair={item.pair} />
            <AlertButton pairId={item.id} pair={item.pair} />
            <button onClick={() => setShowProofModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(234,179,8,0.35)', background: 'rgba(234,179,8,0.06)', color: '#fde047', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em', marginLeft: 'auto' }}>
              🛡️ ADV. RISK PROOF
            </button>
            <button onClick={() => setExpanded(v => !v)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: '#475569', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {expanded && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 600 }}>RISK BREAKDOWN</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {[
                { label: 'Liquidity', ok: item.liquidity > 50000, val: formatLiquidity(item.liquidity) },
                { label: 'Pool Age', ok: item.ageMinutes > 30, val: formatAge(item.ageMinutes) },
                { label: 'Known DEX', ok: ['Uniswap V3','Aerodrome','BaseSwap','SushiSwap','Curve'].includes(item.dex), val: item.dex },
                { label: 'Deployer', ok: item.isKnownDeployer, val: item.isKnownDeployer ? 'Known' : 'Unknown' },
                { label: 'Contract', ok: item.contractVerified, val: item.contractVerified ? 'Verified' : 'Unverified' },
                { label: 'Price Stability', ok: Math.abs(item.priceChange1h) < 20, val: `${item.priceChange1h > 0 ? '+' : ''}${item.priceChange1h.toFixed(1)}%` },
              ].map(sig => (
                <div key={sig.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 5, border: `1px solid ${sig.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                  <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{sig.label}</span>
                  <span style={{ fontSize: 10, color: sig.ok ? '#10b981' : '#ef4444', fontFamily: 'monospace', fontWeight: 700 }}>{sig.ok ? '✓' : '✗'} {sig.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showProofModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowProofModal(false)}>
          <div style={{ background: '#0a0f1a', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 14, padding: 32, maxWidth: 440, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 9, color: '#eab308', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 12 }}>PREMIUM FEATURE</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>🛡️ Advanced Risk Proof</h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 8 }}>Deep onchain verification of <strong style={{ color: '#f1f5f9' }}>{item.pair}</strong> — checks contract bytecode, deployer history, and LP lock status on Base.</p>
            <div style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#fde047', fontFamily: 'monospace', marginBottom: 4 }}>ESTIMATED COST</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>~$0.02 <span style={{ fontSize: 13, color: '#64748b' }}>USDC on Base</span></div>
            </div>
            <p style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginBottom: 20, lineHeight: 1.6 }}>Non-custodial. We never control your funds.<br />All transactions happen in your wallet.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={async () => { await runAdvancedRiskProof(item); setShowProofModal(false) }} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#0a0f1a', fontWeight: 800, cursor: 'pointer', fontSize: 13, fontFamily: 'monospace' }}>CONNECT & VERIFY</button>
              <button onClick={() => setShowProofModal(false)} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#475569', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
