import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Search, Star } from 'lucide-react'
import { MARKETS, sparkData, fmtUsd, colorFor, type Stock } from '@/data/stocks'
import { api } from '@/lib/api'

const OVERVIEW = [
  { label: 'S&P 500',          value: '5,460.48',  change: '+0.62%',  up: true  },
  { label: 'Dow Jones',        value: '39,150.33', change: '+0.34%',  up: true  },
  { label: 'Nasdaq',           value: '17,689.36', change: '+0.95%',  up: true  },
  { label: 'Market Sentiment', value: 'Bullish',   change: 'Risk-On', up: true  },
]

const TABS = ['All', 'Favourites', 'Top Gainers', 'Top Losers']

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 80, H = 32
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', ...style }}>{children}</div>
}

export function LiveMarkets() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [starred, setStarred] = useState<string[]>(['AAPL', 'MSFT'])
  const [apiStocks, setApiStocks] = useState<Stock[] | null>(null)

  useEffect(() => {
    api.get<{ success: boolean; data: any[] }>('/user/market-stocks')
      .then(r => setApiStocks(r.data.map(s => ({ name: s.name, symbol: s.symbol, price: s.price, change: s.change, color: colorFor(s.symbol) }))))
      .catch(() => { /* fall back to static */ })
  }, [])

  const SOURCE = apiStocks && apiStocks.length ? apiStocks : MARKETS

  const filtered = SOURCE.filter(m => {
    if (tab === 'Favourites' && !starred.includes(m.symbol)) return false
    if (tab === 'Top Gainers' && m.change <= 0) return false
    if (tab === 'Top Losers'  && m.change >= 0) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.symbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)' }}>Stocks</h1>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(74,222,128,0.15)', color: '#4ade80', letterSpacing: '0.05em' }}>● LIVE</span>
          </div>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Live prices for stocks, ETFs &amp; ADRs — tap a stock to invest</p>
        </div>
      </div>

      {/* Overview strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {OVERVIEW.map(o => (
          <Card key={o.label} style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginBottom: 5 }}>{o.label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(40 6% 95%)', letterSpacing: '-0.01em', marginBottom: 3 }}>{o.value}</p>
            <span style={{ fontSize: 11, fontWeight: 600, color: o.up ? '#4ade80' : '#f87171' }}>{o.change}</span>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: tab === t ? 'rgba(74,222,128,0.2)' : 'transparent', color: tab === t ? '#86efac' : 'hsl(240 5% 55%)', transition: 'all 0.15s' }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.6rem', padding: '0.4rem 0.75rem', width: '100%', maxWidth: 220 }}>
            <Search size={13} style={{ color: 'hsl(240 5% 50%)', flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stocks…" style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'hsl(40 6% 88%)', width: '100%' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['', '#', 'Stock', 'Price', '24h Change', '7d'].map((h, i) => (
                  <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 50%)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.symbol}
                  onClick={() => navigate(`/dashboard/markets/${m.symbol}`)}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '0.75rem 0.5rem 0.75rem 1rem', width: 32 }}>
                    <button onClick={e => { e.stopPropagation(); setStarred(s => s.includes(m.symbol) ? s.filter(x => x !== m.symbol) : [...s, m.symbol]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: starred.includes(m.symbol) ? '#f59e0b' : 'hsl(240 5% 40%)', padding: 0 }}>
                      <Star size={13} fill={starred.includes(m.symbol) ? '#f59e0b' : 'none'} />
                    </button>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'hsl(240 5% 45%)', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div className="flex items-center gap-2.5">
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${m.color}22`, border: `1px solid ${m.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: m.color, flexShrink: 0 }}>
                        {m.symbol.slice(0, 4)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'hsl(40 6% 92%)', fontSize: 13 }}>{m.name}</p>
                        <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>{m.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'hsl(40 6% 92%)', whiteSpace: 'nowrap' }}>
                    US${fmtUsd(m.price)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: m.change >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                      {m.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Sparkline data={sparkData(m.price, m.change)} color={m.change >= 0 ? '#4ade80' : '#f87171'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
