import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Check } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface UserRow { id: string; firstName: string; lastName: string; email: string }
interface ConfRow {
  signalId: string; pair: string; direction: string; timeframe: string
  status: string; isActive: boolean; defaultConfidence: number; confidence: number
}

const inp: React.CSSProperties = { width: '100%', height: 40, padding: '0 12px', borderRadius: 9, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(40 6% 90%)', outline: 'none', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 55%)', marginBottom: 5 }

export function AdminSignalConfidence() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserRow | null>(null)
  const [rows, setRows] = useState<ConfRow[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRows, setLoadingRows] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [err, setErr] = useState('')

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const res = await adminApi.get<{ success: boolean; data: UserRow[] }>('/admin/users?limit=500')
      setUsers(res.data)
    } catch { /* ignore */ } finally { setLoadingUsers(false) }
  }, [])
  useEffect(() => { loadUsers() }, [loadUsers])

  async function pickUser(u: UserRow) {
    setSelected(u); setRows([]); setErr(''); setLoadingRows(true)
    try {
      const res = await adminApi.get<{ success: boolean; data: ConfRow[] }>(`/admin/signal-confidence?userId=${u.id}`)
      setRows(res.data)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed to load.') } finally { setLoadingRows(false) }
  }

  const setVal = (signalId: string, v: string) =>
    setRows(rs => rs.map(r => r.signalId === signalId ? { ...r, confidence: v === '' ? 0 : Math.max(0, Math.min(100, Number(v) || 0)) } : r))

  async function saveRow(r: ConfRow) {
    if (!selected) return
    setSavingId(r.signalId); setErr('')
    try {
      await adminApi.put('/admin/signal-confidence', { userId: selected.id, signalId: r.signalId, confidence: r.confidence })
      setSavedId(r.signalId); setTimeout(() => setSavedId(p => p === r.signalId ? null : p), 1500)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed.') } finally { setSavingId(null) }
  }

  const filtered = users.filter(u => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
  })

  return (
    <div style={{ padding: '24px 16px 60px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'hsl(40 10% 96%)' }}>Per-Customer Confidence</h1>
        <p style={{ fontSize: 13, color: 'hsl(240 5% 50%)' }}>Set the confidence % each customer sees on every signal. Unset = 0%.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,300px) 1fr', gap: 16, alignItems: 'start' }}>
        {/* Customer picker */}
        <div style={{ borderRadius: 12, background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', padding: 12 }}>
          <label style={lbl}>Customer</label>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: 13, color: 'hsl(240 5% 45%)' }} />
            <input style={{ ...inp, paddingLeft: 32 }} placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {loadingUsers ? (
            <div style={{ padding: 24, textAlign: 'center' }}><Loader2 size={18} style={{ color: 'hsl(240 5% 45%)', animation: 'spin 1s linear infinite' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 460, overflowY: 'auto' }}>
              {filtered.map(u => {
                const on = selected?.id === u.id
                return (
                  <button key={u.id} onClick={() => pickUser(u)} style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', border: '1px solid ' + (on ? 'rgba(34,197,94,0.4)' : 'transparent'), background: on ? 'rgba(34,197,94,0.12)' : 'transparent' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(40 6% 88%)' }}>{u.firstName} {u.lastName}</p>
                    <p style={{ fontSize: 11, color: 'hsl(240 5% 52%)' }}>{u.email}</p>
                  </button>
                )
              })}
              {filtered.length === 0 && <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)', padding: 10 }}>No customers found.</p>}
            </div>
          )}
        </div>

        {/* Signal confidence editor */}
        <div style={{ borderRadius: 12, background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', padding: 16, minHeight: 200 }}>
          {!selected ? (
            <p style={{ fontSize: 13, color: 'hsl(240 5% 50%)', padding: 30, textAlign: 'center' }}>Select a customer to edit their confidence per signal.</p>
          ) : loadingRows ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={20} style={{ color: 'hsl(240 5% 45%)', animation: 'spin 1s linear infinite' }} /></div>
          ) : (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'hsl(40 6% 90%)', marginBottom: 12 }}>{selected.firstName} {selected.lastName} <span style={{ fontWeight: 500, color: 'hsl(240 5% 52%)' }}>· {selected.email}</span></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.map(r => (
                  <div key={r.signalId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: r.direction === 'BUY' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: r.direction === 'BUY' ? '#4ade80' : '#f87171' }}>{r.direction}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'hsl(40 6% 90%)' }}>{r.pair} <span style={{ fontSize: 11, color: 'hsl(240 5% 50%)', fontWeight: 500 }}>· {r.timeframe}</span></p>
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>{r.status}{r.isActive ? '' : ' · hidden'} · default {r.defaultConfidence}%</p>
                    </div>
                    <input type="number" min={0} max={100} value={r.confidence} onChange={e => setVal(r.signalId, e.target.value)} style={{ ...inp, width: 80, height: 36, textAlign: 'center' }} />
                    <button onClick={() => saveRow(r)} disabled={savingId === r.signalId} style={{ minWidth: 72, height: 36, borderRadius: 8, background: savedId === r.signalId ? 'rgba(34,197,94,0.18)' : 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: savedId === r.signalId ? '#4ade80' : '#fff', fontSize: 12, fontWeight: 700, cursor: savingId === r.signalId ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      {savingId === r.signalId ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : savedId === r.signalId ? <><Check size={13} /> Saved</> : 'Save'}
                    </button>
                  </div>
                ))}
                {rows.length === 0 && <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)', padding: 20, textAlign: 'center' }}>No signals exist yet.</p>}
              </div>
            </>
          )}
          {err && <p style={{ fontSize: 12, color: '#f87171', marginTop: 12 }}>{err}</p>}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
