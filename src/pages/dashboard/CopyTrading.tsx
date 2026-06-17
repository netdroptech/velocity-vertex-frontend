import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Users, TrendingUp, ShieldCheck, BadgeCheck, Activity, Search, X, Wallet, History } from 'lucide-react'

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

interface CopyTrade {
  id:          string
  traderName:  string
  traderImage?: string
  amount:      number
  status:      string
  startedAt:   string
  stoppedAt?:  string
}

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
const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 10, color: 'hsl(240 5% 48%)', marginBottom: 2, letterSpacing: '0.03em' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: color ?? 'hsl(40 6% 90%)' }}>{value}</p>
    </div>
  )
}

export function CopyTrading() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const balance = user?.balance ?? 0

  const [traders, setTraders] = useState<CopyTrader[]>([])
  const [trades,  setTrades]  = useState<CopyTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [query,   setQuery]   = useState('')

  // Copy modal state
  const [modalTrader, setModalTrader] = useState<CopyTrader | null>(null)
  const [amount,      setAmount]      = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [modalError,  setModalError]  = useState('')

  const loadTraders = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: CopyTrader[] }>('/user/traders')
      setTraders(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load traders.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTrades = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: CopyTrade[] }>('/user/copy-trades')
      setTrades(res.data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadTraders(); loadTrades() }, [loadTraders, loadTrades])

  function openCopy(t: CopyTrader) {
    setModalTrader(t)
    setAmount(String(t.minAmount))
    setModalError('')
  }

  const amt = Number(amount) || 0
  const insufficient = modalTrader != null && amt > 0 && amt > balance

  async function submitCopy() {
    if (!modalTrader) return
    if (amt < modalTrader.minAmount) { setModalError(`Minimum is ${money(modalTrader.minAmount)}.`); return }
    setSubmitting(true)
    setModalError('')
    try {
      await api.post('/user/copy-trades', { traderId: modalTrader.id, amount: amt })
      await refreshUser()
      await loadTrades()
      await loadTraders()
      setModalTrader(null)
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Could not start copy trade.')
    } finally {
      setSubmitting(false)
    }
  }

  async function stopTrade(id: string) {
    try {
      await api.post(`/user/copy-trades/${id}/stop`, {})
      await refreshUser()
      await loadTrades()
    } catch { /* ignore */ }
  }

  const filtered = traders.filter(t =>
    `${t.name} ${t.username} ${t.strategy} ${t.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto overflow-x-hidden">

      {/* Header + balance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'hsl(40 10% 96%)', lineHeight: 1.2 }}>Copy Trading</h1>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 52%)' }}>Allocate funds to mirror our top-performing traders</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <Wallet size={16} style={{ color: '#4ade80' }} />
          <div>
            <p style={{ fontSize: 10, color: 'hsl(240 5% 55%)' }}>Available Balance</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#4ade80' }}>{money(balance)}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 45%)', pointerEvents: 'none' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search traders or strategies…"
          style={{ width: '100%', height: 42, paddingLeft: 36, paddingRight: 14, borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'hsl(40 6% 90%)', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading && (
        <div style={{ padding: '64px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, border: '3px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'ctSpin 0.7s linear infinite' }} />
          <style>{`@keyframes ctSpin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#f87171', fontSize: 13 }}>{error}</div>
      )}

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
              <div key={t.id} style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {t.imageUrl ? (
                    <img src={mediaUrl(t.imageUrl)} alt={t.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#88fc8a,#00ff04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#050505' }}>{initials(t.name)}</div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(40 10% 94%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
                      {t.isVerified && <BadgeCheck size={15} style={{ color: '#4ade80', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)' }}>@{t.username}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, color: risk.color, background: risk.bg, flexShrink: 0 }}>{t.riskLevel} risk</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={13} style={{ color: 'hsl(240 5% 50%)', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: 'hsl(240 5% 62%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.strategy}</p>
                </div>

                <div style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Stat label="Win Rate" value={`${t.winRate}%`} color="#4ade80" />
                  <Stat label="Monthly" value={`${t.monthlyReturn >= 0 ? '+' : ''}${t.monthlyReturn}%`} color={t.monthlyReturn >= 0 ? '#4ade80' : '#f87171'} />
                  <Stat label="Total" value={`${t.totalReturn >= 0 ? '+' : ''}${t.totalReturn}%`} color={t.totalReturn >= 0 ? '#4ade80' : '#f87171'} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'hsl(240 5% 50%)' }}>
                    <Users size={13} /> {t.followers.toLocaleString()} followers
                  </div>
                  <div style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>
                    Min <span style={{ color: 'hsl(40 6% 85%)', fontWeight: 600 }}>{money(t.minAmount)}</span>
                  </div>
                </div>

                <button
                  onClick={() => openCopy(t)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  <TrendingUp size={14} /> Copy Trader
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      {!loading && trades.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <History size={16} style={{ color: '#4ade80' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'hsl(40 10% 94%)' }}>Copy Trade History</h2>
          </div>
          <div style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            {trades.map((tr, i) => (
              <div key={tr.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < trades.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {tr.traderImage ? (
                  <img src={mediaUrl(tr.traderImage)} alt={tr.traderName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#4ade80' }}>{initials(tr.traderName)}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(40 6% 88%)' }}>{tr.traderName}</p>
                  <p style={{ fontSize: 11, color: 'hsl(240 5% 48%)' }}>{new Date(tr.startedAt).toLocaleDateString()} · {money(tr.amount)}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, color: tr.status === 'active' ? '#4ade80' : 'hsl(240 5% 55%)', background: tr.status === 'active' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)' }}>
                  {tr.status === 'active' ? 'Active' : 'Stopped'}
                </span>
                {tr.status === 'active' && (
                  <button onClick={() => stopTrade(tr.id)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer', flexShrink: 0 }}>Stop</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footnote */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, fontSize: 11.5, color: 'hsl(240 5% 45%)' }}>
          <ShieldCheck size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
          Past performance is not indicative of future results. Copy trading involves risk.
        </div>
      )}

      {/* ── Copy modal ── */}
      {modalTrader && (
        <div onClick={() => !submitting && setModalTrader(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,2,12,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(420px, 100%)', background: 'hsl(260 60% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'hsl(40 10% 95%)' }}>Copy {modalTrader.name}</p>
              <button onClick={() => !submitting && setModalTrader(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(240 5% 55%)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'hsl(240 5% 55%)', marginBottom: 14 }}>
              <span>Available: <span style={{ color: '#4ade80', fontWeight: 700 }}>{money(balance)}</span></span>
              <span>Min: <span style={{ color: 'hsl(40 6% 85%)', fontWeight: 600 }}>{money(modalTrader.minAmount)}</span></span>
            </div>

            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'hsl(240 5% 50%)', letterSpacing: '0.05em', marginBottom: 7, textTransform: 'uppercase' }}>Allocation Amount ($)</label>
            <input
              type="number" inputMode="decimal" value={amount}
              onChange={e => { setAmount(e.target.value); setModalError('') }}
              style={{ width: '100%', height: 48, padding: '0 14px', borderRadius: 10, fontSize: 18, fontWeight: 700, background: 'rgba(255,255,255,0.04)', border: `1px solid ${insufficient ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`, color: 'hsl(40 6% 92%)', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
            />

            {modalError && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{modalError}</p>}

            {insufficient ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 9, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 14 }}>
                  <Wallet size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#f59e0b', lineHeight: 1.5 }}>Insufficient balance. Fund your account to copy this trader.</p>
                </div>
                <button onClick={() => navigate('/dashboard/deposit')} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Wallet size={15} /> Fund Account
                </button>
              </>
            ) : (
              <button onClick={submitCopy} disabled={submitting || amt <= 0} style={{ width: '100%', padding: '12px', borderRadius: 10, background: amt > 0 ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.06)', border: 'none', color: amt > 0 ? '#fff' : 'hsl(240 5% 40%)', fontSize: 14, fontWeight: 700, cursor: submitting || amt <= 0 ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <TrendingUp size={15} /> {submitting ? 'Processing…' : `Copy with ${money(amt)}`}
              </button>
            )}
            <p style={{ fontSize: 11, color: 'hsl(240 5% 45%)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              This amount is deducted from your balance and allocated to copying this trader.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
