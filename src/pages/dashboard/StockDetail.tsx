import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, X, TrendingUp, Wallet, History } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { findStock, statsFor, fmtUsd, changeFor } from '@/data/stocks'

interface StockInvestment {
  id: string
  symbol: string
  name: string
  amount: number
  price: number
  shares: number
  createdAt: string
}

const money = (n: number) => `US$${fmtUsd(n)}`

export function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const balance = user?.balance ?? 0

  const stock = findStock(symbol)
  const [investments, setInvestments] = useState<StockInvestment[]>([])

  // Buy modal
  const [open, setOpen]         = useState(false)
  const [amount, setAmount]     = useState('')
  const [buying, setBuying]     = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const loadInvestments = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: StockInvestment[] }>('/user/stocks')
      setInvestments(res.data)
    } catch { /* ignore */ }
  }, [])
  useEffect(() => { loadInvestments() }, [loadInvestments])

  if (!stock) {
    return (
      <div className="p-6 max-w-[1100px] mx-auto">
        <button onClick={() => navigate('/dashboard/markets')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', color: 'hsl(240 5% 60%)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}><ArrowLeft size={14} /> Back to Stocks</button>
        <p style={{ color: 'hsl(240 5% 55%)' }}>Stock not found.</p>
      </div>
    )
  }

  const s = statsFor(stock.symbol, stock.price)
  const changePct = changeFor(stock.symbol)
  const changeAbs = (changePct / 100) * stock.price
  const up = changePct >= 0
  const ownedShares = investments.filter(i => i.symbol === stock.symbol).reduce((sum, i) => sum + i.shares, 0)

  const amt = Number(amount) || 0
  const insufficient = amt > 0 && amt > balance

  async function buy() {
    if (!stock) return
    if (amt <= 0) { setError('Enter an amount.'); return }
    setBuying(true); setError('')
    try {
      await api.post('/user/stocks/invest', { symbol: stock.symbol, name: stock.name, amount: amt, price: stock.price })
      await refreshUser()
      await loadInvestments()
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete purchase.')
    } finally {
      setBuying(false)
    }
  }

  const stat = (label: string, value: string) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: 12.5, color: 'hsl(240 5% 50%)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'hsl(40 6% 88%)' }}>{value}</span>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto overflow-x-hidden">
      <button onClick={() => navigate('/dashboard/markets')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', color: 'hsl(240 5% 60%)', fontSize: 13, cursor: 'pointer', marginBottom: 18 }}><ArrowLeft size={14} /> Back to Stocks</button>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Left — stock card */}
        <div style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${stock.color}22`, border: `1px solid ${stock.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: stock.color }}>
                {stock.symbol.slice(0, 4)}
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'hsl(40 10% 95%)' }}>{stock.name}</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: 'hsl(40 6% 95%)', marginTop: 4 }}>{money(stock.price)}</p>
                <p style={{ fontSize: 12, color: up ? '#4ade80' : '#f87171', marginTop: 2 }}>
                  {up ? '+' : ''}{changeAbs.toFixed(2)} ({up ? '+' : ''}{changePct.toFixed(2)}%) Today
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', letterSpacing: '0.06em' }}>BALANCE</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'hsl(40 6% 92%)', marginTop: 2 }}>{ownedShares.toFixed(2)} {stock.symbol}</p>
            </div>
          </div>

          <button onClick={() => { setError(''); setDone(false); setAmount(''); setOpen(true) }}
            style={{ width: '100%', padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg,#fb923c,#f97316)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 22 }}>
            Get Started
          </button>

          <p style={{ fontSize: 15, fontWeight: 800, color: 'hsl(40 10% 94%)', marginBottom: 8 }}>Stats</p>
          <div className="grid sm:grid-cols-2 gap-x-8">
            <div>
              {stat('Open', money(s.open))}
              {stat('High', money(s.high))}
              {stat('Low', money(s.low))}
              {stat('52 Wk High', money(s.wkHigh))}
              {stat('Div/Yield', money(s.divYield))}
            </div>
            <div>
              {stat('Volume', `${s.volume.toFixed(2)} M`)}
              {stat('Avg Vol', `${s.avgVol.toFixed(2)} M`)}
              {stat('Mkt Cap', `${s.mktCap.toFixed(2)} B`)}
              {stat('52 Wk Low', money(s.wkLow))}
            </div>
          </div>
        </div>

        {/* Right — investment history */}
        <div style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <History size={16} style={{ color: '#4ade80' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(40 10% 94%)' }}>Your Stock Investments</p>
          </div>
          {investments.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <Wallet size={26} style={{ color: 'rgba(255,255,255,0.14)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, color: 'hsl(240 5% 50%)' }}>No stock investment yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {investments.map(inv => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(40 6% 88%)' }}>{inv.symbol}</p>
                    <p style={{ fontSize: 11, color: 'hsl(240 5% 48%)' }}>{new Date(inv.createdAt).toLocaleDateString()} · {inv.shares.toFixed(4)} shares</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', flexShrink: 0 }}>{money(inv.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buy modal */}
      {open && (
        <div onClick={() => !buying && setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,2,12,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(440px,100%)', background: 'hsl(260 60% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <TrendingUp size={26} style={{ color: '#4ade80' }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'hsl(40 10% 95%)', marginBottom: 6 }}>Purchase Complete</p>
                <p style={{ fontSize: 13, color: 'hsl(240 5% 60%)', marginBottom: 18 }}>You invested {money(amt)} in {stock.name} at {money(stock.price)} per share.</p>
                <button onClick={() => setOpen(false)} style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'hsl(40 10% 95%)' }}>Invest in {stock.symbol}</p>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(240 5% 55%)' }}><X size={18} /></button>
                </div>
                <p style={{ fontSize: 12.5, color: 'hsl(240 5% 60%)', lineHeight: 1.6, marginBottom: 16 }}>
                  To invest in {stock.name} stock, enter the amount you wish to invest and confirm your purchase. Your investment will be processed at the current market price.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'hsl(240 5% 55%)', marginBottom: 12 }}>
                  <span>Balance: <span style={{ color: '#4ade80', fontWeight: 700 }}>{money(balance)}</span></span>
                  <span>Price: <span style={{ color: 'hsl(40 6% 85%)', fontWeight: 600 }}>{money(stock.price)}</span></span>
                </div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'hsl(240 5% 50%)', letterSpacing: '0.05em', marginBottom: 7, textTransform: 'uppercase' }}>Amount (USD)</label>
                <input type="number" inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); setError('') }}
                  style={{ width: '100%', height: 48, padding: '0 14px', borderRadius: 10, fontSize: 18, fontWeight: 700, background: 'rgba(255,255,255,0.04)', border: `1px solid ${insufficient ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`, color: 'hsl(40 6% 92%)', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
                {amt > 0 && <p style={{ fontSize: 11.5, color: 'hsl(240 5% 55%)', marginBottom: 10 }}>≈ {(amt / stock.price).toFixed(4)} {stock.symbol} shares</p>}
                {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{error}</p>}
                {insufficient ? (
                  <>
                    <div style={{ padding: '10px 13px', borderRadius: 9, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 14, fontSize: 12, color: '#f59e0b', lineHeight: 1.5 }}>
                      Insufficient balance. Top up to invest this amount.
                    </div>
                    <button onClick={() => navigate('/dashboard/deposit')} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Go to Deposit</button>
                  </>
                ) : (
                  <button onClick={buy} disabled={buying || amt <= 0} style={{ width: '100%', padding: '12px', borderRadius: 10, background: amt > 0 ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.06)', border: 'none', color: amt > 0 ? '#fff' : 'hsl(240 5% 40%)', fontSize: 14, fontWeight: 700, cursor: buying || amt <= 0 ? 'default' : 'pointer', opacity: buying ? 0.7 : 1 }}>
                    {buying ? 'Processing…' : `Confirm Purchase · ${money(amt)}`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
