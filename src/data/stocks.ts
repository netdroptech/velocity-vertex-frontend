// Shared stock catalogue used by the Stocks list and the Stock detail page.
// Prices/stats are sample data (the platform isn't wired to a live feed).

export const STOCKS: [string, string, number][] = [
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

export function hashNum(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }
export function changeFor(symbol: string) { return Math.round(((hashNum(symbol) % 1250) / 100 - 4.5) * 100) / 100 }
export function colorFor(symbol: string) { return COLORS[hashNum(symbol) % COLORS.length] }

export function sparkData(price: number, change: number): number[] {
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

export function fmtUsd(p: number) {
  return p.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export interface Stock { name: string; symbol: string; price: number; change: number; color: string }

export const MARKETS: Stock[] = STOCKS.map(([name, symbol, price]) => ({
  name, symbol, price, change: changeFor(symbol), color: colorFor(symbol),
}))

export function findStock(symbol?: string): Stock | undefined {
  if (!symbol) return undefined
  const s = symbol.toUpperCase()
  return MARKETS.find(m => m.symbol === s)
}

// Deterministic per-stock stats for the detail page
export function statsFor(symbol: string, price: number) {
  const h = hashNum(symbol)
  const open   = price * (1 + (((h % 60) / 1000) - 0.03))
  const high   = price * (1 + (((h % 25) / 1000) + 0.006))
  const low    = price * (1 - (((h >> 3) % 25) / 1000 + 0.006))
  const wkHigh = price * (1 + (((h >> 5) % 200) / 1000 + 0.06))
  const wkLow  = price * (1 - (((h >> 7) % 350) / 1000 + 0.12))
  const volume = (h % 380) + 18                 // in millions
  const avgVol = ((h >> 4) % 300) + 25          // in millions
  const mktCap = price * (((h >> 2) % 9000) + 400) / 1000  // in billions
  const divYield = price * (1 - ((h % 30) / 1000 + 0.05))
  return { open, high, low, wkHigh, wkLow, volume, avgVol, mktCap, divYield }
}
