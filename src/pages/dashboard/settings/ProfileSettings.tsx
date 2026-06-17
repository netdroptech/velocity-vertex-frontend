import { useState, useEffect, useRef } from 'react'
import { Camera, User, AtSign, FileText, Twitter, Linkedin, Globe, Save, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { api } from '../../../lib/api'

// Build an absolute URL for uploaded images (strip the trailing /api from the API base)
const MEDIA_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/api\/?$/, '')
const mediaUrl = (p?: string) => (p ? (p.startsWith('http') ? p : `${MEDIA_BASE}${p}`) : '')

function SettingsCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(40 10% 94%)', marginBottom: 3 }}>{title}</p>
        {sub && <p style={{ fontSize: 12, color: 'hsl(240 5% 52%)' }}>{sub}</p>}
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(240 5% 55%)', marginBottom: 7, letterSpacing: '0.03em' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, paddingLeft: 14, paddingRight: 14,
  borderRadius: 10, fontSize: 13, fontWeight: 500,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  color: 'hsl(40 6% 90%)', outline: 'none', boxSizing: 'border-box',
}

export function ProfileSettings() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm] = useState({
    displayName: '',
    username:    '',
    bio:         '',
    twitter:     '',
    linkedin:    '',
    website:     '',
  })

  // Populate the form from the logged-in user once it loads
  useEffect(() => {
    if (!user) return
    setForm({
      displayName: user.displayName ?? `${user.firstName} ${user.lastName}`.trim(),
      username:    user.username ?? '',
      bio:         user.bio ?? '',
      twitter:     user.twitter ?? '',
      linkedin:    user.linkedin ?? '',
      website:     user.website ?? '',
    })
  }, [user])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await api.put('/user/profile', form)
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large. Max size is 2MB.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('avatar', file)
      await api.upload('/user/avatar', data)
      await refreshUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const avatarSrc  = mediaUrl(user?.avatarUrl)
  const avatarChar = (user?.displayName || user?.firstName || 'U').charAt(0).toUpperCase()

  return (
    <div className="p-4 md:p-6 max-w-[760px] mx-auto overflow-x-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'hsl(240 5% 60%)', fontSize: 12 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'hsl(40 10% 96%)', lineHeight: 1.2 }}>Profile Settings</h1>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 52%)' }}>Update your display name, avatar and public profile</p>
        </div>
      </div>

      {/* Avatar */}
      <SettingsCard title="Profile Picture" sub="Upload a photo that represents you">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #88fc8a 0%, #00ff04 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, color: '#050505',
              }}>{avatarChar}</div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: 'hsl(260 87% 8%)', border: '2px solid hsl(260 87% 5%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
              <Camera size={12} style={{ color: '#86efac' }} />
            </button>
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'hsl(40 6% 85%)', marginBottom: 6 }}>Upload a new avatar</p>
            <p style={{ fontSize: 11, color: 'hsl(240 5% 48%)', marginBottom: 12 }}>JPG, PNG or WebP. Max size 2MB.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 8, background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac', cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1 }}>{uploading ? 'Uploading…' : 'Upload Photo'}</button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Basic Info */}
      <SettingsCard title="Display Name & Username" sub="This is how you appear across the platform">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="DISPLAY NAME">
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 45%)', pointerEvents: 'none' }} />
              <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.displayName} onChange={set('displayName')} />
            </div>
          </Field>
          <Field label="USERNAME">
            <div style={{ position: 'relative' }}>
              <AtSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 45%)', pointerEvents: 'none' }} />
              <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.username} onChange={set('username')} />
            </div>
          </Field>
        </div>
        <Field label="BIO">
          <div style={{ position: 'relative' }}>
            <FileText size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'hsl(240 5% 45%)', pointerEvents: 'none' }} />
            <textarea
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              style={{ ...inputStyle, height: 'auto', paddingLeft: 34, paddingTop: 10, paddingBottom: 10, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>
          <p style={{ fontSize: 11, color: 'hsl(240 5% 45%)', marginTop: 5 }}>{form.bio.length}/160 characters</p>
        </Field>
      </SettingsCard>

      {/* Social Links */}
      <SettingsCard title="Social Links" sub="Add links to your public profiles">
        {[
          { key: 'twitter',  label: 'TWITTER / X',  icon: Twitter,  placeholder: '@yourhandle' },
          { key: 'linkedin', label: 'LINKEDIN',      icon: Linkedin, placeholder: 'linkedin.com/in/you' },
          { key: 'website',  label: 'WEBSITE',       icon: Globe,    placeholder: 'https://yoursite.com' },
        ].map(({ key, label, icon: Icon, placeholder }) => (
          <Field key={key} label={label}>
            <div style={{ position: 'relative' }}>
              <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 45%)', pointerEvents: 'none' }} />
              <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={set(key as keyof typeof form)} />
            </div>
          </Field>
        ))}
      </SettingsCard>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
        {error && <span style={{ fontSize: 12, color: '#f87171', marginRight: 'auto' }}>{error}</span>}
        <button onClick={() => navigate(-1)} style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(240 5% 55%)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, background: saved ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg,#16a34a,#15803d)', border: saved ? '1px solid rgba(74,222,128,0.3)' : 'none', color: saved ? '#4ade80' : '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }}>
          <Save size={14} /> {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
