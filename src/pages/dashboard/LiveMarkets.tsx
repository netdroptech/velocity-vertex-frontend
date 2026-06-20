import { useState } from 'react'
import { TrendingUp, TrendingDown, Search, Star } from 'lucide-react'

// ── Full stock list: [name, ticker, price] ──────────────────────────────────
const STOCKS: [string, string, number][] = [
  ['3M Company', 'MMM', 158.72],
  ['Abbott Laboratories', 'ABT', 132.59],
  ['Adobe Inc.', 'ADBE', 362.09],
  ['Advanced Micro Devices, Inc.', 'AMD', 167.76],
  ['Aethlon Medical, Inc.', 'AEMD', 1.59],
  ['Alibaba Group Holding Limited', 'BABA', 122.94],
  ['Alpha Pro Tech, Ltd.', 'APT', 4.84],
  ['Alphabet Inc.', 'GOOGL', 206.09],
  ['Altria Group, Inc.', 'MO', 67.67],
  ['Amazon.com, Inc.', 'AMZN', 228.84],
  ['AMC Entertainment Holdings, Inc.', 'AMC', 2.95],
  ['American Express Company', 'AXP', 319.16],
  ['American International Group, Inc.', 'AIG', 83.38],
  ['American Tower Corporation', 'AMT', 211.88],
  ['Analog Devices, Inc.', 'ADI', 252.20],
  ['Apple Inc.', 'AAPL', 227.76],
  ['ASML Holding N.V.', 'ASML', 754.89],
  ['AT&T Inc.', 'T', 28.77],
  ['Aterian, Inc.', 'ATER', 1.04],
  ['Baidu, Inc.', 'BIDU', 90.01],
  ['Bank of America Corporation', 'BAC', 49.48],
  ['Block, Inc.', 'SQ', 83.46],
  ['Bristol-Myers Squibb Company', 'BMY', 47.92],
  ['Camber Energy, Inc.', 'CEI', 0.10],
  ['Cardiff Oncology, Inc.', 'CRDF', 2.32],
  ['Caterpillar Inc.', 'CAT', 435.67],
  ['Chevron Corporation', 'CVX', 152.40],
  ['Chewy, Inc.', 'CHWY', 39.57],
  ['Cisco Systems, Inc.', 'CSCO', 67.32],
  ['Citigroup Inc.', 'C', 95.26],
  ['Clear Channel Outdoor Holdings, Inc.', 'CCO', 1.28],
  ['Colgate-Palmolive Company', 'CL', 85.94],
  ['Comcast Corporation', 'CMCSA', 34.15],
  ['Costco Wholesale Corporation', 'COST', 958.54],
  ['eBay Inc.', 'EBAY', 99.22],
  ['Exxon Mobil Corporation', 'XOM', 111.28],
  ['Fastly, Inc.', 'FSLY', 7.50],
  ['Ferrari N.V.', 'RACE', 471.02],
  ['GE Aerospace', 'GE', 266.53],
  ['General Motors Company', 'GM', 58.37],
  ['Gevo, Inc.', 'GEVO', 1.73],
  ['Honeywell International Inc.', 'HON', 222.83],
  ['InMode Ltd.', 'INMD', 14.81],
  ['Intel Corporation', 'INTC', 24.80],
  ['International Business Machines Corporation', 'IBM', 242.09],
  ['Johnson & Johnson', 'JNJ', 179.29],
  ['JPMorgan Chase & Co.', 'JPM', 296.24],
  ['Las Vegas Sands Corp.', 'LVS', 55.05],
  ['Lennar Corporation', 'LEN', 135.75],
  ['Marin Software Incorporated', 'MRIN', 0.90],
  ['Mastercard Incorporated', 'MA', 598.96],
  ['Merck & Co., Inc.', 'MRK', 87.37],
  ['Microsoft Corporation', 'MSFT', 507.23],
  ['Mondelez International, Inc.', 'MDLZ', 63.41],
  ['Monster Beverage Corporation', 'MNST', 62.84],
  ['Morgan Stanley', 'MS', 148.02],
  ['Motorola Solutions, Inc.', 'MSI', 461.91],
  ['Netflix, Inc.', 'NFLX', 1204.65],
  ['NIKE, Inc.', 'NKE', 78.38],
  ['Novartis AG', 'NVS', 126.98],
  ['NVIDIA Corporation', 'NVDA', 177.99],
  ['Oracle Corporation', 'ORCL', 236.37],
  ['PayPal Holdings, Inc.', 'PYPL', 69.90],
  ['PepsiCo, Inc.', 'PEP', 149.64],
  ['Pfizer Inc.', 'PFE', 25.88],
  ['Ralph Lauren Corporation', 'RL', 285.80],
  ['ReWalk Robotics Ltd.', 'RWLK', 1.05],
  ['Rocket Lab USA, Inc.', 'RKLB', 44.38],
  ['Salesforce, Inc.', 'CRM', 248.29],
  ['Snap Inc.', 'SNAP', 7.20],
  ['SSR Mining Inc.', 'SSRM', 17.11],
  ['Starbucks Corporation', 'SBUX', 88.38],
  ['T-Mobile US, Inc.', 'TMUS', 251.95],
  ['Taiwan Semiconductor Manufacturing Company Limited', 'TSM', 232.99],
  ['Tesla, Inc.', 'TSLA', 340.01],
  ['Teva Pharmaceutical Industries Limited', 'TEVA', 18.46],
  ['The Boeing Company', 'BA', 230.12],
  ['The Coca-Cola Company', 'KO', 70.13],
  ['The Goldman Sachs Group, Inc.', 'GS', 741.89],
  ['The Home Depot, Inc.', 'HD', 412.79],
  ['The Procter & Gamble Company', 'PG', 158.67],
  ['The Walt Disney Company', 'DIS', 118.86],
  ['Toyota Motor Corporation', 'TM', 201.37],
  ['Tripadvisor, Inc.', 'TRIP', 17.69],
  ['Twitter, Inc. (delisted)', 'TWTR', 53.70],
  ['UnitedHealth Group Incorporated', 'UNH', 307.42],
  ['Verizon Communications Inc.', 'VZ', 44.44],
  ['Visa Inc.', 'V', 350.04],
  ['Walmart Inc.', 'WMT', 96.83],
  ['Wells Fargo & Company', 'WFC', 72.50],
]

const COLORS = ['#f59e0b', '#60a5fa', '#4ade80', '#fbbf24', '#34d399', '#f87171', '#38bdf8', '#e879f9', '#818cf8', '#a3a3a3']
function hashNum(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }
function changeFor(symbol: string) { return Math.round(((hashNum(symbol) % 1250) / 100 - 4.5) * 100) / 100 } // ~ -4.5 … +8
function colorFor(symbol: string) { return COLORS[hashNum(symbol) % COLORS.length] }
function sparkData(price: number, change: number): number[] {
  const drift = (change / 100) * price
  const start = price - drift
  const out: number[] = []
  for (let i = 0; i < 6; i++) {
    const t = i / 5
    out.push(Math.max(0.001, start + drift * t + Math.sin(i * 1.7) * Math.abs(drift) * 0.18))
  }
  out[5] = price
  return out
}

const MARKETS = STOCKS.map(([name, symbol, price]) => ({
  name, symbol, price, change: changeFor(symbol), color: colorFor(symbol),
}))

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

function fmtPrice(p: number) {
  return p.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)' }}>Stocks</h1>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(74,222,128,0.15)', color: '#4ade80', letterSpacing: '0.05em' }}>● LIVE</span>
          </div>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Live prices for stocks, ETFs &amp; ADRs</p>
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
                <tr key={m.symbol} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
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
                    US${fmtPrice(m.price)}
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
