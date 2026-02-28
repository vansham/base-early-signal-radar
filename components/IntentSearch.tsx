'use client'

const TAGS = [
  { label: 'NEW POOL', query: 'new_pool' },
  { label: 'WHALE', query: 'whale_entry' },
  { label: 'USDC', query: 'USDC' },
  { label: 'UNISWAP', query: 'Uniswap' },
  { label: 'HIGH RISK', query: 'high risk' },
  { label: 'VOLUME', query: 'unusual_volume' },
]

export default function IntentSearch({ value, onChange, resultCount }: {
  value: string
  onChange: (v: string) => void
  resultCount: number
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      <div style={{ position: 'relative', background: 'rgba(6,13,20,0.95)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#00c8ff', opacity: 0.6 }}>⌕</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="What do you want to explore on Base? e.g. new pools, whale activity, USDC pairs..."
          style={{ width: '100%', padding: '14px 110px 14px 44px', background: 'transparent', border: 'none', outline: 'none', color: '#e8f4ff', fontSize: 13, fontFamily: 'Space Mono, monospace' }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', right: 90, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a6a80', fontSize: 14, cursor: 'pointer' }}
          >✕</button>
        )}
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: '#2a4a60', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>
          {resultCount} SIGNALS
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {TAGS.map(tag => {
          const active = value === tag.query
          return (
            <button
              key={tag.label}
              onClick={() => onChange(active ? '' : tag.query)}
              style={{
                padding: '4px 12px', borderRadius: 3,
                border: `1px solid ${active ? 'rgba(0,200,255,0.4)' : 'rgba(0,200,255,0.1)'}`,
                background: active ? 'rgba(0,200,255,0.1)' : 'transparent',
                color: active ? '#00c8ff' : '#3a5a70',
                fontSize: 9, fontFamily: 'Space Mono, monospace',
                cursor: 'pointer', letterSpacing: '0.12em', fontWeight: 700,
                transition: 'all 0.15s',
              }}
            >
              {tag.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
