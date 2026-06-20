import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface Stock {
  id: string; symbol: string; name: string; price: number; change: number
  open?: number | null; high?: number | null; low?: number | null
  wkHigh?: number | null; wkLow?: number | null
  volume?: number | null; avgVol?: number | null; mktCap?: number | null; divYield?: number | null
  isActive: boolean; sortOrder: number
}

const BLANK = { symbol: '', name: '', price: 0, change: 0, open: '', high: '', low: '', wkHigh: '', wkLow: '', volume: '', avgVol: '', mktCap: '', divYield: '', isActive: true, sortOrder: 0 }

const inp: React.CSSProperties = { width: '100%', height: 40, padding: '0 12px', borderRadius: 9, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(40 6% 90%)', outline: 'none', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 55%)', marginBottom: 5 }

export function AdminStocks() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.get<{ success: boolean; data: Stock[] }>('/admin/stocks')
      setStocks(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true); setErr('')
    try {
      if (editing.id) await adminApi.put(`/admin/stocks/${editing.id}`, editing)
      else await adminApi.post('/admin/stocks', editing)
      setEditing(null)
      await load()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed.') } finally { setSaving(false) }
  }
  async function remove(id: string) {
    if (!confirm('Delete this stock?')) return
    try { await adminApi.delete(`/admin/stocks/${id}`); await load() } catch { /* ignore */ }
  }

  const set = (k: string, v: any) => setEditing((e: any) => ({ ...e, [k]: v }))
  const filtered = stocks.filter(s => `${s.symbol} ${s.name}`.toLowerCase().includes(q.toLowerCase()))

  const numField = (label: string, key: string, ph = '') => (
    <div><label style={lbl}>{label}</label><input style={inp} type="number" value={editing[key] ?? ''} onChange={e => set(key, e.target.value)} placeholder={ph} /></div>
  )

  return (
    <div style={{ padding: '24px 16px 60px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'hsl(40 10% 96%)' }}>Stocks</h1>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 50%)' }}>Manage the stock catalogue, prices and stats</p>
        </div>
        <button onClick={() => setEditing({ ...BLANK })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> Add Stock
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 320 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 45%)' }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search stocks…" style={{ ...inp, paddingLeft: 34 }} />
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={22} style={{ color: 'hsl(240 5% 45%)', animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#60a5fa', flexShrink: 0 }}>{s.symbol.slice(0, 4)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'hsl(40 6% 90%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                <p style={{ fontSize: 11.5, color: 'hsl(240 5% 52%)' }}>{s.symbol} · US${s.price.toFixed(2)} · {s.change >= 0 ? '+' : ''}{s.change}%{s.isActive ? '' : ' · hidden'}</p>
              </div>
              <button onClick={() => setEditing({ ...s })} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={14} /></button>
              <button onClick={() => remove(s.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'hsl(240 5% 50%)', padding: 30 }}>No stocks match.</p>}
        </div>
      )}

      {editing && (
        <div onClick={() => !saving && setEditing(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,2,12,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px,100%)', background: 'hsl(260 60% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 22, margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'hsl(40 10% 95%)' }}>{editing.id ? 'Edit Stock' : 'New Stock'}</p>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(240 5% 55%)' }}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label style={lbl}>Symbol</label><input style={inp} value={editing.symbol} onChange={e => set('symbol', e.target.value)} placeholder="AAPL" /></div>
              <div><label style={lbl}>Name</label><input style={inp} value={editing.name} onChange={e => set('name', e.target.value)} placeholder="Apple Inc." /></div>
              {numField('Price (US$)', 'price', '227.76')}
              {numField('Change today (%)', 'change', '0.85')}
              {numField('Open', 'open')}
              {numField('High', 'high')}
              {numField('Low', 'low')}
              {numField('52 Wk High', 'wkHigh')}
              {numField('52 Wk Low', 'wkLow')}
              {numField('Div / Yield', 'divYield')}
              {numField('Volume (M)', 'volume')}
              {numField('Avg Vol (M)', 'avgVol')}
              {numField('Mkt Cap (B)', 'mktCap')}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: 'hsl(40 6% 80%)', cursor: 'pointer' }}>
              <input type="checkbox" checked={editing.isActive} onChange={e => set('isActive', e.target.checked)} /> Visible to users
            </label>
            <p style={{ fontSize: 11, color: 'hsl(240 5% 45%)', marginTop: 8 }}>Leave stats blank to auto-derive them from the price.</p>
            {err && <p style={{ fontSize: 12, color: '#f87171', marginTop: 10 }}>{err}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(240 5% 65%)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save Stock'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
