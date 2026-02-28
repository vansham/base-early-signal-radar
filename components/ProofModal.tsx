'use client'
import { useState, useEffect } from 'react'
import { RadarItem } from '@/lib/types'
import { connectWallet, shortenAddress } from './WalletConnect'

type Step = 'idle' | 'connecting' | 'connected' | 'sending' | 'scanning' | 'done' | 'error'

interface ScanResult {
  riskScore: number
  riskLevel: string
  flags: string[]
  positives: string[]
  details: Record<string, unknown>
}

export default function ProofModal({ item, onClose }: { item: RadarItem; onClose: () => void }) {
  const [step, setStep] = useState<Step>('idle')
  const [address, setAddress] = useState('')
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleConnect = async () => {
    setStep('connecting')
    setError('')
    try {
      const wallet = await connectWallet()
      setAddress(wallet.address)
      setStep('connected')
    } catch (err: unknown) {
      const e = err as Error
      if (e.message === 'NO_WALLET') setError('Koi wallet install nahi! MetaMask ya Rabby install karo.')
      else if (e.message?.includes('rejected') || e.message?.includes('denied')) setError('Wallet connect reject kar diya.')
      else setError('Wallet connect failed: ' + e.message)
      setStep('error')
    }
  }

  const handleVerifyAndScan = async () => {
    setStep('sending')
    setError('')
    try {
      const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
      if (!eth) throw new Error('Wallet not found')

      // Builder Code as hex
      const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE || 'bc_cpho8un9'
      const builderHex = '0x' + Array.from(builderCode).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')

      // Real transaction with builder code in calldata
      const tx = await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, to: address, value: '0x0', data: builderHex, gas: '0x5208' }]
      }) as string
      setTxHash(tx)

      // Now run real deep scan
      setStep('scanning')
      const res = await fetch('/api/deepscan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: item.deployer.includes('...') ? item.deployer : item.deployer, pair: item.pair }),
      })
      const data = await res.json()
      if (data.success) setScanResult(data)
      setStep('done')

    } catch (err: unknown) {
      const e = err as Error
      if (e.message?.includes('rejected') || e.message?.includes('4001')) setError('Transaction reject kar diya.')
      else setError('Failed: ' + e.message)
      setStep('error')
    }
  }

  const riskColor = scanResult?.riskLevel === 'LOW' ? '#00e5a0' : scanResult?.riskLevel === 'MEDIUM' ? '#ffb800' : '#ff3b5c'

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(2,5,8,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }} onClick={onClose}>
      <div style={{ background: '#07101a', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 10, padding: 28, maxWidth: 500, width: '100%', position: 'relative', margin: 'auto' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: '#4a6a80', fontSize: 18, cursor: 'pointer' }}>✕</button>

        <div style={{ fontSize: 8, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.2em', marginBottom: 10 }}>◆ PREMIUM ONCHAIN FEATURE</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8f4ff', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>🛡️ Advanced Risk Proof</h3>
        <p style={{ fontSize: 11, color: '#4a6a80', lineHeight: 1.7, marginBottom: 18, fontFamily: 'Space Mono, monospace' }}>
          Onchain verification of <strong style={{ color: '#e8f4ff' }}>{item.pair}</strong> — real contract scan via Basescan + Builder Code tx.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {[
            { n: '01', label: 'Connect Wallet', done: ['connected','sending','scanning','done'].includes(step), active: step === 'connecting' },
            { n: '02', label: 'Send Verification TX', done: ['scanning','done'].includes(step), active: step === 'sending' },
            { n: '03', label: 'Deep Contract Scan', done: step === 'done', active: step === 'scanning' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: s.done ? 'rgba(0,229,160,0.05)' : s.active ? 'rgba(0,200,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.done ? 'rgba(0,229,160,0.2)' : s.active ? 'rgba(0,200,255,0.12)' : 'rgba(0,200,255,0.06)'}`, borderRadius: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.done ? '#00e5a0' : 'rgba(0,200,255,0.06)', border: `1px solid ${s.done ? '#00e5a0' : 'rgba(0,200,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.active ? <span style={{ fontSize: 12, color: '#00c8ff', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
                  : <span style={{ fontSize: 8, color: s.done ? '#020508' : '#3a5a70', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{s.done ? '✓' : s.n}</span>}
              </div>
              <span style={{ fontSize: 11, color: s.done ? '#00e5a0' : s.active ? '#00c8ff' : '#4a6a80', fontFamily: 'Space Mono, monospace', flex: 1 }}>{s.label}</span>
              {s.n === '01' && address && ['connected','sending','scanning','done'].includes(step) && <span style={{ fontSize: 9, color: '#3a5a70', fontFamily: 'Space Mono, monospace' }}>{shortenAddress(address)}</span>}
            </div>
          ))}
        </div>

        {/* Status messages */}
        {step === 'sending' && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 5, display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ fontSize: 15, color: '#ffb800', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span><span style={{ fontSize: 10, color: '#ffb800', fontFamily: 'Space Mono, monospace' }}>CONFIRM TX IN YOUR WALLET...</span></div>}
        {step === 'scanning' && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 5, display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ fontSize: 15, color: '#a5b4fc', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span><span style={{ fontSize: 10, color: '#a5b4fc', fontFamily: 'Space Mono, monospace' }}>SCANNING CONTRACT ON BASESCAN...</span></div>}
        {step === 'error' && error && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,59,92,0.05)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 5 }}><span style={{ fontSize: 10, color: '#ff3b5c', fontFamily: 'Space Mono, monospace' }}>✗ {error}</span></div>}

        {/* SCAN RESULTS */}
        {step === 'done' && scanResult && (
          <div style={{ marginBottom: 16 }}>
            {/* TX Link */}
            {txHash && <div style={{ marginBottom: 10, padding: '8px 12px', background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 4 }}>
              <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#00c8ff', fontFamily: 'Space Mono, monospace', textDecoration: 'none' }}>🔗 TX: {txHash.slice(0,12)}...{txHash.slice(-6)} — View on Basescan ↗</a>
            </div>}

            {/* Risk Score */}
            <div style={{ padding: '14px 16px', background: `${riskColor}08`, border: `1px solid ${riskColor}30`, borderRadius: 6, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 8, color: '#3a5a70', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 4 }}>SCAN RISK SCORE</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: riskColor, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{scanResult.riskScore}<span style={{ fontSize: 13, color: '#3a5a70' }}>/100</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: riskColor, fontFamily: 'Space Mono, monospace', padding: '6px 12px', background: `${riskColor}12`, border: `1px solid ${riskColor}30`, borderRadius: 4 }}>{scanResult.riskLevel} RISK</div>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
              {[
                { label: 'Contract', val: scanResult.details.contractVerified ? '✓ Verified' : '✗ Unverified', ok: !!scanResult.details.contractVerified },
                { label: 'Name', val: String(scanResult.details.contractName || 'Unknown'), ok: scanResult.details.contractName !== 'Unknown' },
                { label: 'Age', val: String(scanResult.details.age || 'Unknown'), ok: true },
                { label: 'Balance', val: String(scanResult.details.balance || '0 ETH'), ok: true },
                { label: 'Recent TXs', val: String(scanResult.details.recentTxCount || 0), ok: Number(scanResult.details.recentTxCount) > 5 },
                { label: 'Token TXs', val: String(scanResult.details.tokenTxCount || 0), ok: Number(scanResult.details.tokenTxCount) > 0 },
              ].map(d => (
                <div key={d.label} style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${d.ok ? 'rgba(0,229,160,0.12)' : 'rgba(255,59,92,0.12)'}`, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#3a5a70', fontFamily: 'Space Mono, monospace' }}>{d.label}</span>
                  <span style={{ fontSize: 9, color: d.ok ? '#00e5a0' : '#ff3b5c', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{d.val}</span>
                </div>
              ))}
            </div>

            {/* Flags */}
            {scanResult.flags.length > 0 && (
              <div style={{ padding: '10px 12px', background: 'rgba(255,59,92,0.04)', border: '1px solid rgba(255,59,92,0.15)', borderRadius: 5, marginBottom: 8 }}>
                <div style={{ fontSize: 8, color: '#ff3b5c', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 6 }}>⚠ {scanResult.flags.length} FLAG(S) DETECTED</div>
                {scanResult.flags.map((f, i) => <div key={i} style={{ fontSize: 10, color: '#ff3b5c99', fontFamily: 'Space Mono, monospace', marginBottom: 3 }}>• {f}</div>)}
              </div>
            )}

            {/* Positives */}
            {scanResult.positives.length > 0 && (
              <div style={{ padding: '10px 12px', background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 5 }}>
                <div style={{ fontSize: 8, color: '#00e5a0', fontFamily: 'Space Mono, monospace', letterSpacing: '0.15em', marginBottom: 6 }}>✓ {scanResult.positives.length} POSITIVE SIGNAL(S)</div>
                {scanResult.positives.map((p, i) => <div key={i} style={{ fontSize: 10, color: '#00e5a099', fontFamily: 'Space Mono, monospace', marginBottom: 3 }}>• {p}</div>)}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        {(step === 'idle' || step === 'error') && (
          <button onClick={handleConnect} style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', cursor: 'pointer', marginBottom: 10 }}>
            🔗 CONNECT WALLET →
          </button>
        )}
        {step === 'connecting' && <button disabled style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'rgba(255,184,0,0.4)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', cursor: 'wait', marginBottom: 10 }}>◌ OPENING WALLET...</button>}
        {step === 'connected' && (
          <button onClick={handleVerifyAndScan} style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', cursor: 'pointer', marginBottom: 10 }}>
            🛡️ VERIFY & DEEP SCAN →
          </button>
        )}
        {step === 'done' && <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 6, border: '1px solid rgba(0,229,160,0.3)', background: 'rgba(0,229,160,0.08)', color: '#00e5a0', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', cursor: 'pointer', marginBottom: 10 }}>✓ DONE — CLOSE</button>}

        <p style={{ fontSize: 9, color: '#1a3040', fontFamily: 'Space Mono, monospace', textAlign: 'center' }}>Non-custodial · We never control your funds · All transactions in your wallet</p>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}
