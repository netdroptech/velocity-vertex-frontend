import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Users, TrendingUp, ShieldCheck, BadgeCheck, Activity, Search } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────
interface CopyTrader {
  id:            string
  name:          string
  username:      string
  imageUrl?:     string
  strategy:      string
  description?:  string
  winRate:       number
  monthlyReturn: number
  totalReturn:   number
  followers:     number
  minAmount:     number
  riskLevel:     string
  tags:          string[]
  isVerified:    boolean
}

// Build an absolute URL for uploaded images (strip the trailing /api from the API base)
const MEDIA_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/api\/?$/, '')
const mediaUrl = (p?: string) => (p ? (p.startsWith('http') ? p : `${MEDIA_BASE}${p}`) : '')

const RISK_COLOR: Record<string, { color: string; bg: string }> = {
  Low:    { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  High:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 10, color: 'hsl(240 5% 48%)', marginBottom: 2, letterSpacing: '0.03em' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: color ?? 'hsl(40 6% 90%)' }}>{value}</p>
    </div>
  )
}

export function CopyTrading() {
  const [traders, setTraders] = useState<CopyTrader[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [query,   setQuery]   = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ success: boolean; data: CopyTrader[] }>('/traders')
        setTraders(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load traders.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = traders.filter(t =>
    `${t.name} ${t.username} ${t.strategy} ${t.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto overflow-x-hidden">

      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'hsl(40 10% 96%)', lineHeight: 1.2 }}>Copy Trading</h1>
        <p style={{ fontSize: 13, color: 'hsl(240 5% 52%)' }}>Follow and mirror the strategies of our top-performing traders</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 45%)', pointerEvents: 'none' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search traders or strategies…"
          style={{
            width: '100%', height: 42, paddingLeft: 36, paddingRight: 14,
            borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)', color: 'hsl(40 6% 90%)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '64px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, border: '3px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'ctSpin 0.7s linear infinite' }} />
          <style>{`@keyframes ctSpin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#f87171', fontSize: 13 }}>{error}</div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ padding: '56px 20px', textAlign: 'center' }}>
          <Users size={30} style={{ color: 'rgba(255,255,255,0.14)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(240 5% 50%)' }}>No traders available</p>
          <p style={{ fontSize: 12, color: 'hsl(240 5% 38%)', marginTop: 4 }}>Check back soon — new traders are added regularly.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => {
            const risk = RISK_COLOR[t.riskLevel] ?? RISK_COLOR.Medium
            return (
              <div key={t.id} style={{
                background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {/* Top: avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {t.imageUrl ? (
                    <img src={mediaUrl(t.imageUrl)} alt={t.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#88fc8a,#00ff04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: '#050505',
                    }}>{initials(t.name)}</div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(40 10% 94%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
                      {t.isVerified && <BadgeCheck size={15} style={{ color: '#4ade80', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)' }}>@{t.username}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, color: risk.color, background: risk.bg, flexShrink: 0 }}>
                    {t.riskLevel} risk
                  </span>
                </div>

                {/* Strategy */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={13} style={{ color: 'hsl(240 5% 50%)', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: 'hsl(240 5% 62%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.strategy}</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Stat label="Win Rate" value={`${t.winRate}%`} color="#4ade80" />
                  <Stat label="Monthly" value={`${t.monthlyReturn >= 0 ? '+' : ''}${t.monthlyReturn}%`} color={t.monthlyReturn >= 0 ? '#4ade80' : '#f87171'} />
                  <Stat label="Total" value={`${t.totalReturn >= 0 ? '+' : ''}${t.totalReturn}%`} color={t.totalReturn >= 0 ? '#4ade80' : '#f87171'} />
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'hsl(240 5% 50%)' }}>
                    <Users size={13} /> {t.followers.toLocaleString()} followers
                  </div>
                  <div style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>
                    Min <span style={{ color: 'hsl(40 6% 85%)', fontWeight: 600 }}>${t.minAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => alert(`Copying ${t.name}'s strategy is coming soon.`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    width: '100%', padding: '10px', borderRadius: 10,
                    background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <TrendingUp size={14} /> Copy Trader
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Footnote */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, fontSize: 11.5, color: 'hsl(240 5% 45%)' }}>
          <ShieldCheck size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
          Past performance is not indicative of future results. Copy trading involves risk.
        </div>
      )}
    </div>
  )
}
