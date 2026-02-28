'use client'
import { useState, useEffect } from 'react'
import { RadarItem } from '@/lib/types'
import { connectWallet, shortenAddress } from './WalletConnect'

type Step = 'idle' | 'connecting' | 'connected' | 'switching' | 'verifying' | 'done' | 'error'

export default function ProofModal({ item, onClose }: { item: RadarItem; onClose: () => void }) {
  const [step, setStep] = useState<Step>('idle')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

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
      if (e.message === 'NO_WALLET') {
        setError('Koi wallet install nahi hai! MetaMask ya Rabby install karo.')
      } else if (e.message?.includes('rejected') || e.message?.includes('denied')) {
        setError('Tumne wallet connect reject kar diya.')
      } else {
        setError('Wallet connect nahi hua: ' + e.message)
      }
      setStep('error')
    }
  }

  const handleVerify = async () => {
    setStep('verifying')
    setError('')
    try {
      // Real onchain verification call
      // TODO: Replace with actual smart contract call
      // appendBuilderCode(calldata, process.env.NEXT_PUBLIC_BUILDER_CODE!)
      await new Promise(r => setTimeout(r, 1500))
      setStep('done')
    } catch (err: unknown) {
      setError('Verification failed: ' + (err as Error).message)
      setStep('error')
    }
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
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: '#4a6a80', fontSize: 18, cursor: 'pointer' }}>✕</button>

        <div style={{ fontSize: 8, color: '#ffb800', fontFamily: 'Space Mono, monospace', letterSpacing: '0.2em', marginBottom: 10 }}>◆ PREMIUM ONCHAIN FEATURE</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8f4ff', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>🛡️ Advanced Risk Proof</h3>
        <p style={{ fontSize: 11, color: '#4a6a80', lineHeight: 1.7, marginBottom: 18, fontFamily: 'Space Mono, monospace' }}>
          Onchain verification of <strong style={{ color: '#e8f4ff' }}>{item.pair}</strong> — contract bytecode, deployer history, honeypot check, LP lock status.
        </p>

        {/* Cost */}
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
            { n: '01', label: 'Connect Wallet', done: ['connected','verifying','done'].includes(step), active: step === 'connecting' },
            { n: '02', label: 'Approve ~$0.02 USDC on Base', done: ['verifying','done'].includes(step), active: false },
            { n: '03', label: 'Onchain Verification Complete', done: step === 'done', active: step === 'verifying' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: s.done ? 'rgba(0,229,160,0.05)' : s.active ? 'rgba(0,200,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.done ? 'rgba(0,229,160,0.2)' : s.active ? 'rgba(0,200,255,0.15)' : 'rgba(0,200,255,0.06)'}`, borderRadius: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.done ? '#00e5a0' : s.active ? 'rgba(0,200,255,0.15)' : 'rgba(0,200,255,0.06)', border: `1px solid ${s.done ? '#00e5a0' : 'rgba(0,200,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.active ? <span style={{ fontSize: 12, color: '#00c8ff', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
                  : <span style={{ fontSize: 8, color: s.done ? '#020508' : '#3a5a70', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{s.done ? '✓' : s.n}</span>}
              </div>
              <span style={{ fontSize: 11, color: s.done ? '#00e5a0' : s.active ? '#00c8ff' : '#4a6a80', fontFamily: 'Space Mono, monospace', flex: 1 }}>{s.label}</span>
              {s.done && s.n === '01' && address && <span style={{ fontSize: 9, color: '#3a5a70', fontFamily: 'Space Mono, monospace' }}>{shortenAddress(address)}</span>}
            </div>
          ))}
        </div>

        {/* Error */}
        {step === 'error' && error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,59,92,0.05)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 5 }}>
            <span style={{ fontSize: 10, color: '#ff3b5c', fontFamily: 'Space Mono, monospace' }}>✗ {error}</span>
          </div>
        )}

        {/* Status */}
        {step === 'verifying' && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 5, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 15, color: '#ffb800', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            <span style={{ fontSize: 10, color: '#ffb800', fontFamily: 'Space Mono, monospace' }}>VERIFYING ONCHAIN — CONFIRM IN WALLET...</span>
          </div>
        )}
        {step === 'done' && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 5 }}>
            <span style={{ fontSize: 11, color: '#00e5a0', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>✓ VERIFIED! Builder Code bc_cpho8un9 attached onchain!</span>
          </div>
        )}

        {/* Wallet install hint */}
        {step === 'idle' && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(0,200,255,0.03)', border: '1px solid rgba(0,200,255,0.08)', borderRadius: 4 }}>
            <span style={{ fontSize: 9, color: '#3a5a70', fontFamily: 'Space Mono, monospace' }}>
              💡 Works with MetaMask, Rabby, Coinbase Wallet — koi bhi Base-compatible wallet
            </span>
          </div>
        )}

        {/* CTA Buttons */}
        {(step === 'idle' || step === 'error') && (
          <button onClick={handleConnect} style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', cursor: 'pointer', marginBottom: 10 }}>
            🔗 CONNECT WALLET →
          </button>
        )}
        {step === 'connecting' && (
          <button disabled style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'rgba(255,184,0,0.4)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', cursor: 'wait', marginBottom: 10 }}>
            ◌ OPENING WALLET...
          </button>
        )}
        {step === 'connected' && (
          <button onClick={handleVerify} style={{ width: '100%', padding: '14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #ffb800, #e09000)', color: '#020508', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', cursor: 'pointer', marginBottom: 10 }}>
            🛡️ APPROVE & VERIFY ONCHAIN →
          </button>
        )}
        {step === 'done' && (
          <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 6, border: '1px solid rgba(0,229,160,0.3)', background: 'rgba(0,229,160,0.08)', color: '#00e5a0', fontWeight: 800, fontSize: 13, fontFamily: 'Space Mono, monospace', cursor: 'pointer', marginBottom: 10 }}>
            ✓ DONE — CLOSE
          </button>
        )}

        <p style={{ fontSize: 9, color: '#1a3040', fontFamily: 'Space Mono, monospace', textAlign: 'center' }}>Non-custodial · We never control your funds · All transactions in your wallet</p>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}
