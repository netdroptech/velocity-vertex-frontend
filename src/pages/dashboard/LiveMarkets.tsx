import { useState } from 'react'
import { TrendingUp, TrendingDown, Search, Star } from 'lucide-react'

const MARKETS = [
  { name: 'Apple Inc.',     symbol: 'AAPL',  price: 228.52, change: +0.85, vol: '$8.4B',  cap: '$3.47T', data: [224,225,226,227,228,228.52],     color: '#a3a3a3', starred: true  },
  { name: 'Microsoft',      symbol: 'MSFT',  price: 415.26, change: +1.12, vol: '$6.1B',  cap: '$3.08T', data: [408,410,412,411,414,415.26],     color: '#60a5fa', starred: true  },
  { name: 'NVIDIA',         symbol: 'NVDA',  price: 135.58, change: +2.34, vol: '$22.7B', cap: '$3.33T', data: [128,130,131,133,134,135.58],     color: '#4ade80', starred: false },
  { name: 'Amazon',         symbol: 'AMZN',  price: 185.42, change: -0.42, vol: '$5.3B',  cap: '$1.93T', data: [188,187,186,185.5,185,185.42],   color: '#fbbf24', starred: false },
  { name: 'Alphabet',       symbol: 'GOOGL', price: 178.35, change: +0.64, vol: '$4.2B',  cap: '$2.19T', data: [175,176,177,176.5,178,178.35],   color: '#f87171', starred: false },
  { name: 'Tesla',          symbol: 'TSLA',  price: 248.50, change: -1.88, vol: '$18.9B', cap: '$792B',  data: [256,254,252,250,249,248.5],      color: '#ef4444', starred: false },
  { name: 'Meta Platforms', symbol: 'META',  price: 560.14, change: +1.45, vol: '$7.8B',  cap: '$1.42T', data: [548,551,554,556,558,560.14],     color: '#38bdf8', starred: false },
  { name: 'Netflix',        symbol: 'NFLX',  price: 697.50, change: +0.92, vol: '$2.1B',  cap: '$300B',  data: [688,690,692,694,696,697.5],      color: '#e879f9', starred: false },
  { name: 'JPMorgan Chase', symbol: 'JPM',   price: 214.80, change: +0.33, vol: '$1.9B',  cap: '$614B',  data: [212,213,213.5,214,214.5,214.8],  color: '#34d399', starred: false },
  { name: 'Visa',           symbol: 'V',     price: 279.96, change: -0.21, vol: '$1.4B',  cap: '$561B',  data: [282,281,280.5,280,279.8,279.96], color: '#818cf8', starred: false },
]

const OVERVIEW = [
  { label: 'S&P 500',          value: '5,460.48',  change: '+0.62%',  up: true  },
  { label: 'Dow Jones',        value: '39,150.33', change: '+0.34%',  up: true  },
  { label: 'Nasdaq',           value: '17,689.36', change: '+0.95%',  up: true  },
  { label: 'Market Sentiment', value: 'Bullish',   change: 'Risk-On', up: true  },
]

const TABS = ['All', 'Favourites', 'Top Gainers', 'Top Losers']

/** Pure SVG sparkline — zero dependencies */
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
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [starred, setStarred] = useState<string[]>(['AAPL', 'MSFT'])

  const filtered = MARKETS.filter(m => {
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
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)' }}>Live Markets</h1>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(74,222,128,0.15)', color: '#4ade80', letterSpacing: '0.05em' }}>● LIVE</span>
          </div>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Real-time stock prices and market data</p>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search markets…" style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'hsl(40 6% 88%)', width: '100%' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['','#','Asset','Price','24h Change','Volume','Market Cap','7d'].map((h, i) => (
                  <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 50%)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.symbol} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '0.75rem 0.5rem 0.75rem 1rem', width: 32 }}>
                    <button onClick={() => setStarred(s => s.includes(m.symbol) ? s.filter(x => x !== m.symbol) : [...s, m.symbol])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: starred.includes(m.symbol) ? '#f59e0b' : 'hsl(240 5% 40%)', padding: 0 }}>
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
                    ${m.price >= 1 ? m.price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : m.price.toFixed(4)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: m.change >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                      {m.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'hsl(240 5% 65%)' }}>{m.vol}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'hsl(240 5% 65%)' }}>{m.cap}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Sparkline data={m.data} color={m.change >= 0 ? '#4ade80' : '#f87171'} />
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
