import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface Signal {
  id: string
  pair: string; direction: string; timeframe: string
  entry: string; target1: string; target2?: string | null; stopLoss: string
  confidence: number; riskReward: string; status: string; analyst: string
  note?: string | null; price: number; isActive: boolean; sortOrder: number
}

const BLANK = { pair: '', direction: 'BUY', timeframe: '4H', entry: '', target1: '', target2: '', stopLoss: '', confidence: 80, riskReward: '1:2', status: 'active', analyst: 'Apex AI', note: '', price: 50, isActive: true, sortOrder: 0 }

const inp: React.CSSProperties = { width: '100%', height: 40, padding: '0 12px', borderRadius: 9, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(40 6% 90%)', outline: 'none', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 55%)', marginBottom: 5 }

export function AdminSignals() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.get<{ success: boolean; data: Signal[] }>('/admin/signals')
      setSignals(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true); setErr('')
    try {
      if (editing.id) await adminApi.put(`/admin/signals/${editing.id}`, editing)
      else await adminApi.post('/admin/signals', editing)
      setEditing(null)
      await load()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed.') } finally { setSaving(false) }
  }
  async function remove(id: string) {
    if (!confirm('Delete this signal?')) return
    try { await adminApi.delete(`/admin/signals/${id}`); await load() } catch { /* ignore */ }
  }

  const set = (k: string, v: any) => setEditing((e: any) => ({ ...e, [k]: v }))

  return (
    <div style={{ padding: '24px 16px 60px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'hsl(40 10% 96%)' }}>Premium Signals</h1>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 50%)' }}>Create and manage trade signals shown to users</p>
        </div>
        <button onClick={() => setEditing({ ...BLANK })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> Add Signal
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={22} style={{ color: 'hsl(240 5% 45%)', animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {signals.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 6, background: s.direction === 'BUY' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: s.direction === 'BUY' ? '#4ade80' : '#f87171' }}>{s.direction}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(40 6% 90%)' }}>{s.pair} <span style={{ fontSize: 11, color: 'hsl(240 5% 50%)', fontWeight: 500 }}>· {s.timeframe}</span></p>
                <p style={{ fontSize: 11.5, color: 'hsl(240 5% 52%)' }}>Entry {s.entry} · TP {s.target1}{s.target2 ? ` / ${s.target2}` : ''} · SL {s.stopLoss} · {s.confidence}% · ${s.price}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, color: s.status === 'active' ? '#4ade80' : s.status === 'pending' ? '#f59e0b' : 'hsl(240 5% 55%)', background: 'rgba(255,255,255,0.05)' }}>{s.status}{s.isActive ? '' : ' · hidden'}</span>
              <button onClick={() => setEditing({ ...s, target2: s.target2 ?? '', note: s.note ?? '' })} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={14} /></button>
              <button onClick={() => remove(s.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
            </div>
          ))}
          {signals.length === 0 && <p style={{ textAlign: 'center', color: 'hsl(240 5% 50%)', padding: 30 }}>No signals yet. Add one.</p>}
        </div>
      )}

      {editing && (
        <div onClick={() => !saving && setEditing(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,2,12,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px,100%)', background: 'hsl(260 60% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 22, margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'hsl(40 10% 95%)' }}>{editing.id ? 'Edit Signal' : 'New Signal'}</p>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(240 5% 55%)' }}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label style={lbl}>Pair</label><input style={inp} value={editing.pair} onChange={e => set('pair', e.target.value)} placeholder="BTC/USDT" /></div>
              <div><label style={lbl}>Direction</label><select style={inp} value={editing.direction} onChange={e => set('direction', e.target.value)}><option value="BUY">BUY</option><option value="SELL">SELL</option></select></div>
              <div><label style={lbl}>Timeframe</label><input style={inp} value={editing.timeframe} onChange={e => set('timeframe', e.target.value)} placeholder="4H" /></div>
              <div><label style={lbl}>Status</label><select style={inp} value={editing.status} onChange={e => set('status', e.target.value)}><option value="active">active</option><option value="pending">pending</option><option value="closed">closed</option></select></div>
              <div><label style={lbl}>Entry</label><input style={inp} value={editing.entry} onChange={e => set('entry', e.target.value)} placeholder="$82,400 – $83,100" /></div>
              <div><label style={lbl}>Stop Loss</label><input style={inp} value={editing.stopLoss} onChange={e => set('stopLoss', e.target.value)} placeholder="$80,800" /></div>
              <div><label style={lbl}>Target 1</label><input style={inp} value={editing.target1} onChange={e => set('target1', e.target.value)} placeholder="$86,500" /></div>
              <div><label style={lbl}>Target 2</label><input style={inp} value={editing.target2} onChange={e => set('target2', e.target.value)} placeholder="$89,200" /></div>
              <div><label style={lbl}>Confidence (%)</label><input style={inp} type="number" value={editing.confidence} onChange={e => set('confidence', e.target.value)} /></div>
              <div><label style={lbl}>Risk / Reward</label><input style={inp} value={editing.riskReward} onChange={e => set('riskReward', e.target.value)} placeholder="1:3" /></div>
              <div><label style={lbl}>Analyst</label><input style={inp} value={editing.analyst} onChange={e => set('analyst', e.target.value)} /></div>
              <div><label style={lbl}>Price ($)</label><input style={inp} type="number" value={editing.price} onChange={e => set('price', e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 12 }}><label style={lbl}>Note / Analysis</label><textarea value={editing.note} onChange={e => set('note', e.target.value)} rows={3} style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: 'hsl(40 6% 80%)', cursor: 'pointer' }}>
              <input type="checkbox" checked={editing.isActive} onChange={e => set('isActive', e.target.checked)} /> Visible to users
            </label>
            {err && <p style={{ fontSize: 12, color: '#f87171', marginTop: 10 }}>{err}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(240 5% 65%)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save Signal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
