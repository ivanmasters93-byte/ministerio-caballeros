'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Phone, MapPin, Briefcase, Heart, Calendar, Save, Check } from 'lucide-react'

interface ProfileData {
  name: string
  email: string
  phone: string
  fechaNacimiento: string
  direccion: string
  ocupacion: string
  estadoCivil: string
  estado: string
  red: { nombre: string; tipo: string } | null
}

export default function MiPerfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    phone: '',
    direccion: '',
    ocupacion: '',
    estadoCivil: '',
  })

  useEffect(() => {
    fetch('/api/mi-perfil')
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setForm({
          phone: data.phone || '',
          direccion: data.direccion || '',
          ocupacion: data.ocupacion || '',
          estadoCivil: data.estadoCivil || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/mi-perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        <User size={48} className="mx-auto mb-3 opacity-30" />
        <p>No se pudo cargar el perfil</p>
      </div>
    )
  }

  const infoFields = [
    { icon: Mail, label: 'Correo', value: profile.email, key: null as string | null },
    { icon: Phone, label: 'Telefono', value: editing ? form.phone : profile.phone, key: 'phone' as string | null },
    { icon: MapPin, label: 'Direccion', value: editing ? form.direccion : profile.direccion, key: 'direccion' as string | null },
    { icon: Briefcase, label: 'Ocupacion', value: editing ? form.ocupacion : profile.ocupacion, key: 'ocupacion' as string | null },
    { icon: Heart, label: 'Estado Civil', value: editing ? form.estadoCivil : profile.estadoCivil, key: 'estadoCivil' as string | null },
    { icon: Calendar, label: 'Fecha Nacimiento', value: profile.fechaNacimiento ? new Date(profile.fechaNacimiento).toLocaleDateString('es') : null, key: null as string | null },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(135deg, var(--color-accent-gold), rgba(201, 168, 76, 0.2))' }} />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 pt-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{
              background: 'var(--color-bg-base)',
              border: '4px solid var(--color-accent-gold)',
              color: 'var(--color-accent-gold)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="text-center sm:text-left flex-1 pb-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              {profile.name}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              {profile.red && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(201, 168, 76, 0.15)', color: 'var(--color-accent-gold)' }}
                >
                  {profile.red.nombre}
                </span>
              )}
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  background: profile.estado === 'ACTIVO' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.1)',
                  color: profile.estado === 'ACTIVO' ? 'rgb(74, 222, 128)' : 'var(--color-text-muted)',
                }}
              >
                {profile.estado}
              </span>
            </div>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2"
            style={{
              background: saved ? 'rgba(74, 222, 128, 0.15)' : editing ? 'var(--color-accent-gold)' : 'var(--color-bg-elevated)',
              color: saved ? 'rgb(74, 222, 128)' : editing ? 'var(--color-bg-base)' : 'var(--color-text-secondary)',
              border: `1px solid ${saved ? 'rgba(74, 222, 128, 0.3)' : editing ? 'var(--color-accent-gold)' : 'var(--color-border-subtle)'}`,
            }}
          >
            {saved ? <><Check size={14} /> Guardado</> : editing ? <><Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}</> : 'Editar Perfil'}
          </button>
        </div>
      </div>

      {/* Info Fields */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}
      >
        {infoFields.map(({ icon: Icon, label, value, key }, idx) => (
          <div
            key={label}
            className="flex items-center gap-4 px-5 py-4"
            style={idx < infoFields.length - 1 ? { borderBottom: '1px solid var(--color-border-subtle)' } : undefined}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg-elevated)' }}>
              <Icon size={18} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              {editing && key ? (
                <input
                  type="text"
                  value={(form as Record<string, string>)[key] || ''}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full mt-1 h-8 px-2 text-sm rounded-lg outline-none"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder={`Tu ${label.toLowerCase()}...`}
                />
              ) : (
                <p className="text-sm truncate" style={{ color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  {value || 'Sin especificar'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
