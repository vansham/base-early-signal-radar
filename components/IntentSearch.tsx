'use client'

export default function IntentSearch({ value, onChange, resultCount }: { value: string; onChange: (v: string) => void; resultCount: number }) {
  return (
    <div style={{ position: 'relative', marginBottom: 32 }}>
      <div style={{ position: 'relative', background: 'rgba(15,22,36,0.9)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#3b82f6', opacity: 0.7 }}>⌕</span>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="What do you want to explore on Base? e.g. new pools, whale activity, USDC pairs..." style={{ width: '100%', padding: '16px 120px 16px 48px', background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 14, fontFamily: 'monospace' }} />
        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{resultCount} SIGNALS</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {['new pool', 'whale', 'USDC', 'Uniswap', 'high risk', 'volume'].map(tag => (
          <button key={tag} onClick={() => onChange(value === tag ? '' : tag)} style={{ padding: '4px 12px', borderRadius: 4, border: `1px solid ${value === tag ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`, background: value === tag ? 'rgba(59,130,246,0.1)' : 'transparent', color: value === tag ? '#93c5fd' : '#475569', fontSize: 10, fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>{tag}</button>
        ))}
      </div>
    </div>
  )
}
