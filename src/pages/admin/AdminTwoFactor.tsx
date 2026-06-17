import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface SetupData { secret: string; otpauth: string; qrDataUrl: string }

export function AdminTwoFactor() {
  const [enabled, setEnabled]   = useState<boolean | null>(null)
  const [setup,   setSetup]     = useState<SetupData | null>(null)
  const [code,    setCode]      = useState('')
  const [busy,    setBusy]      = useState(false)
  const [error,   setError]     = useState('')
  const [success, setSuccess]   = useState('')

  // Load current status
  useEffect(() => {
    adminApi.get<{ success: boolean; data: { enabled: boolean } }>('/admin/2fa')
      .then(res => setEnabled(res.data.enabled))
      .catch(() => setEnabled(false))
  }, [])

  async function startSetup() {
    setBusy(true); setError(''); setSuccess('')
    try {
      const res = await adminApi.post<{ success: boolean; data: SetupData }>('/admin/2fa/setup', {})
      setSetup(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start setup.')
    } finally { setBusy(false) }
  }

  async function enable() {
    setBusy(true); setError(''); setSuccess('')
    try {
      await adminApi.post('/admin/2fa/enable', { token: code })
      setEnabled(true); setSetup(null); setCode('')
      setSuccess('Two-factor authentication is now enabled.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code.')
    } finally { setBusy(false) }
  }

  async function disable() {
    setBusy(true); setError(''); setSuccess('')
    try {
      await adminApi.post('/admin/2fa/disable', { token: code })
      setEnabled(false); setCode('')
      setSuccess('Two-factor authentication disabled.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code.')
    } finally { setBusy(false) }
  }

  const codeInput = (
    <input
      inputMode="numeric"
      value={code}
      onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
      placeholder="000000"
      style={{ width: 160, height: 46, borderRadius: 10, fontSize: 20, fontWeight: 800, letterSpacing: 8, textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(40 6% 92%)', outline: 'none' }}
    />
  )

  return (
    <div style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 20, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 34, height: 34, borderRadius: '0.55rem', background: enabled ? 'rgba(74,222,128,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {enabled ? <ShieldCheck size={17} style={{ color: '#4ade80' }} /> : <ShieldAlert size={17} style={{ color: '#f59e0b' }} />}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(40 10% 94%)' }}>Two-Factor Authentication</p>
          <p style={{ fontSize: 12, color: 'hsl(240 5% 52%)' }}>Protect the admin panel with Google Authenticator</p>
        </div>
        {enabled !== null && (
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, color: enabled ? '#4ade80' : '#f59e0b', background: enabled ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.12)' }}>
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        )}
      </div>

      <div style={{ padding: '20px 22px' }}>
        {error   && <div style={{ marginBottom: 14, fontSize: 12, color: '#f87171' }}>{error}</div>}
        {success && <div style={{ marginBottom: 14, fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={13} /> {success}</div>}

        {enabled === null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'hsl(240 5% 50%)', fontSize: 13 }}>
            <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading…
          </div>
        )}

        {/* Disabled, no active setup → show Enable button */}
        {enabled === false && !setup && (
          <div>
            <p style={{ fontSize: 13, color: 'hsl(240 5% 60%)', lineHeight: 1.6, marginBottom: 16 }}>
              Add a second layer of security. Once enabled, you'll need a code from your authenticator app every time you sign in.
            </p>
            <button onClick={startSetup} disabled={busy} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              {busy ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ShieldCheck size={14} />} Enable 2FA
            </button>
          </div>
        )}

        {/* Setup flow → QR + code entry */}
        {enabled === false && setup && (
          <div>
            <p style={{ fontSize: 13, color: 'hsl(40 6% 82%)', marginBottom: 16, lineHeight: 1.6 }}>
              1. Scan this QR code with Google Authenticator (or Authy). 2. Enter the 6-digit code it shows to confirm.
            </p>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
              <img src={setup.qrDataUrl} alt="2FA QR code" style={{ width: 148, height: 148, borderRadius: 12, background: '#fff', padding: 6 }} />
              <div>
                <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginBottom: 4 }}>Or enter this key manually:</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'hsl(40 6% 88%)', letterSpacing: 2, fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: 240 }}>{setup.secret}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {codeInput}
              <button onClick={enable} disabled={busy || code.length !== 6} style={{ padding: '10px 20px', borderRadius: 10, background: code.length === 6 ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.06)', border: 'none', color: code.length === 6 ? '#fff' : 'hsl(240 5% 40%)', fontSize: 13, fontWeight: 700, cursor: code.length === 6 && !busy ? 'pointer' : 'default' }}>
                Confirm & Enable
              </button>
            </div>
          </div>
        )}

        {/* Enabled → allow disable (requires a code) */}
        {enabled === true && (
          <div>
            <p style={{ fontSize: 13, color: 'hsl(240 5% 60%)', lineHeight: 1.6, marginBottom: 16 }}>
              2FA is active on this admin account. To turn it off, enter a current code from your authenticator app.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {codeInput}
              <button onClick={disable} disabled={busy || code.length !== 6} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: 13, fontWeight: 700, cursor: code.length === 6 && !busy ? 'pointer' : 'default', opacity: code.length === 6 ? 1 : 0.6 }}>
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
