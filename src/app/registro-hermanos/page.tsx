'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Check, Loader2, User, Phone as PhoneIcon, Mail, MapPin, Briefcase, Heart, Users } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

type Step = 'datos' | 'confirmar' | 'sending' | 'listo'

interface FormData {
  nombre: string
  edad: string
  telefono: string
  email: string
  direccion: string
  ocupacion: string
  estadoCivil: string
  red: 'MENOR' | 'MEDIA' | 'MAYOR' | ''
}

const CIVIL_OPTIONS = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Union libre']

const RED_OPTIONS: { value: 'MENOR' | 'MEDIA' | 'MAYOR'; label: string; range: string }[] = [
  { value: 'MENOR', label: 'Red Menor', range: '18 - 30 anios' },
  { value: 'MEDIA', label: 'Red Media', range: '31 - 40 anios' },
  { value: 'MAYOR', label: 'Red Mayor', range: '41+ anios' },
]

export default function RegistroHermanos() {
  const [step, setStep] = useState<Step>('datos')
  const [formData, setFormData] = useState<FormData>({
    nombre: '', edad: '', telefono: '', email: '',
    direccion: '', ocupacion: '', estadoCivil: '', red: ''
  })
  const [error, setError] = useState('')
  const [fadeIn, setFadeIn] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const update = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // Auto-assign red based on age
  useEffect(() => {
    const age = parseInt(formData.edad)
    if (!isNaN(age) && age >= 18) {
      if (age <= 30) update('red', 'MENOR')
      else if (age <= 40) update('red', 'MEDIA')
      else update('red', 'MAYOR')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.edad])

  const transition = (next: Step) => {
    setFadeIn(false)
    setTimeout(() => {
      setStep(next)
      setFadeIn(true)
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }

  const validate = (): boolean => {
    const fields: (keyof FormData)[] = ['nombre', 'edad', 'telefono', 'email', 'direccion', 'ocupacion', 'estadoCivil']
    const labels: Record<string, string> = {
      nombre: 'nombre completo', edad: 'edad', telefono: 'telefono',
      email: 'email', direccion: 'direccion', ocupacion: 'ocupacion',
      estadoCivil: 'estado civil'
    }
    for (const f of fields) {
      if (!formData[f]?.trim()) {
        setError(`Completa tu ${labels[f] || f}`)
        return false
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email no valido')
      return false
    }
    const age = parseInt(formData.edad)
    if (isNaN(age) || age < 18 || age > 100) {
      setError('Edad debe ser entre 18 y 100')
      return false
    }
    if (!formData.red) {
      setError('Selecciona una red')
      return false
    }
    return true
  }

  const submit = async () => {
    transition('sending')
    try {
      const res = await fetch('/api/registro-hermanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error en el registro')
      }
      setTimeout(() => transition('listo'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Intenta de nuevo')
      transition('confirmar')
    }
  }

  const redName = formData.red === 'MENOR' ? 'Red Menor' : formData.red === 'MEDIA' ? 'Red Media' : formData.red === 'MAYOR' ? 'Red Mayor' : ''

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-y-auto relative"
      style={{
        background: 'var(--color-bg-base, #0a0e1a)',
        color: 'var(--color-text-primary, #f0f0f5)',
      }}
    >
      {/* Background watermark logo — large, centered, translucent with gold glow */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            opacity: 0.06,
            filter: 'drop-shadow(0 0 80px rgba(201,168,76,0.4)) drop-shadow(0 0 160px rgba(201,168,76,0.2))',
          }}
        >
          <Logo size={320} />
        </div>
      </div>
      {/* Header bar */}
      <div
        className="sticky top-0 z-20 px-6 py-4 relative"
        style={{
          background: 'var(--color-bg-surface, #12162a)',
          borderBottom: '1px solid var(--color-border-subtle, rgba(255,255,255,0.06))',
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                borderRadius: 10,
                padding: 2,
                background: 'linear-gradient(135deg, rgba(201,168,76,0.35), rgba(201,168,76,0.08))',
                flexShrink: 0,
              }}
            >
              <Logo size={40} animated />
            </div>
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.3))' }}
              >
                Ministerio de Caballeros
              </p>
              <h1
                className="text-[18px] font-bold tracking-tight gold-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                GEDEONES GP
              </h1>
            </div>
          </div>
          {/* Step indicator */}
          {step !== 'sending' && step !== 'listo' && (
            <div className="flex items-center gap-2">
              {['datos', 'confirmar'].map((s, i) => (
                <div
                  key={s}
                  className="h-1 rounded-full transition-all duration-200"
                  style={{
                    width: s === step ? '24px' : '8px',
                    background: s === step
                      ? 'var(--color-accent-gold, #c9a84c)'
                      : i < ['datos', 'confirmar'].indexOf(step)
                        ? 'rgba(201,168,76,0.4)'
                        : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`relative z-10 transition-all duration-200 ease-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

        {/* =================== STEP 1: DATOS =================== */}
        {step === 'datos' && (
          <div className="px-6 py-8">
            <div className="w-full max-w-lg mx-auto space-y-6">
              <div>
                <h2
                  className="text-[22px] font-bold"
                  style={{ color: 'var(--color-text-primary, #f0f0f5)' }}
                >
                  Registro
                </h2>
                <p
                  className="text-[13px] mt-1"
                  style={{ color: 'var(--color-text-secondary, rgba(255,255,255,0.5))' }}
                >
                  Completa tus datos para unirte a GEDEONES
                </p>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <InputField
                  icon={User}
                  label="Nombre completo"
                  value={formData.nombre}
                  onChange={v => update('nombre', v)}
                  placeholder="Tu nombre completo"
                />

                {/* Edad + Telefono */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Edad"
                    value={formData.edad}
                    onChange={v => update('edad', v)}
                    placeholder="Ej: 28"
                    type="number"
                  />
                  <InputField
                    icon={PhoneIcon}
                    label="Telefono"
                    value={formData.telefono}
                    onChange={v => update('telefono', v)}
                    placeholder="+507..."
                    type="tel"
                  />
                </div>

                {/* Email */}
                <InputField
                  icon={Mail}
                  label="Email"
                  value={formData.email}
                  onChange={v => update('email', v)}
                  placeholder="tu@email.com"
                  type="email"
                />

                {/* Direccion */}
                <InputField
                  icon={MapPin}
                  label="Direccion"
                  value={formData.direccion}
                  onChange={v => update('direccion', v)}
                  placeholder="Tu area o barrio"
                />

                {/* Ocupacion */}
                <InputField
                  icon={Briefcase}
                  label="Ocupacion"
                  value={formData.ocupacion}
                  onChange={v => update('ocupacion', v)}
                  placeholder="A que te dedicas"
                />

                {/* Estado civil */}
                <div>
                  <label
                    className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-2"
                    style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.3))' }}
                  >
                    <Heart size={12} />
                    Estado civil
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {CIVIL_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => update('estadoCivil', opt)}
                        className="py-3 rounded-xl text-[13px] transition-all duration-150"
                        style={{
                          background: formData.estadoCivil === opt
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(255,255,255,0.02)',
                          border: formData.estadoCivil === opt
                            ? '1px solid rgba(255,255,255,0.2)'
                            : '1px solid rgba(255,255,255,0.06)',
                          color: formData.estadoCivil === opt
                            ? 'var(--color-text-primary, #f0f0f5)'
                            : 'var(--color-text-secondary, rgba(255,255,255,0.4))',
                          minHeight: '44px',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Red selection */}
                <div>
                  <label
                    className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-2"
                    style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.3))' }}
                  >
                    <Users size={12} />
                    Red
                    {formData.edad && formData.red && (
                      <span
                        className="normal-case tracking-normal text-[11px] ml-1"
                        style={{ color: 'var(--color-accent-gold, #c9a84c)' }}
                      >
                        (sugerida por tu edad)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {RED_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => update('red', opt.value)}
                        className="py-3 px-2 rounded-xl text-center transition-all duration-150"
                        style={{
                          background: formData.red === opt.value
                            ? 'rgba(201,168,76,0.12)'
                            : 'rgba(255,255,255,0.02)',
                          border: formData.red === opt.value
                            ? '1px solid rgba(201,168,76,0.3)'
                            : '1px solid rgba(255,255,255,0.06)',
                          minHeight: '44px',
                        }}
                      >
                        <p
                          className="text-[13px] font-medium"
                          style={{
                            color: formData.red === opt.value
                              ? 'var(--color-accent-gold, #c9a84c)'
                              : 'var(--color-text-primary, #f0f0f5)',
                          }}
                        >
                          {opt.label}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.3))' }}
                        >
                          {opt.range}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-[13px] px-3 py-2 rounded-lg" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
                  {error}
                </p>
              )}

              <button
                onClick={() => validate() && transition('confirmar')}
                className="w-full py-4 rounded-xl text-[14px] font-semibold tracking-wide transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.8), rgba(201,168,76,0.6))',
                  color: '#fff',
                  minHeight: '48px',
                }}
              >
                Revisar datos
              </button>
            </div>
          </div>
        )}

        {/* =================== STEP 2: CONFIRMAR =================== */}
        {step === 'confirmar' && (
          <div className="px-6 py-8">
            <div className="w-full max-w-lg mx-auto space-y-6">
              <div>
                <h2
                  className="text-[22px] font-bold"
                  style={{ color: 'var(--color-text-primary, #f0f0f5)' }}
                >
                  Confirma tus datos
                </h2>
                <p
                  className="text-[13px] mt-1"
                  style={{ color: 'var(--color-text-secondary, rgba(255,255,255,0.5))' }}
                >
                  Verifica que todo este correcto
                </p>
              </div>

              <div
                className="rounded-xl p-5 space-y-3"
                style={{
                  background: 'var(--color-bg-surface, #12162a)',
                  border: '1px solid var(--color-border-subtle, rgba(255,255,255,0.06))',
                }}
              >
                <SummaryRow label="Nombre" value={formData.nombre} />
                <SummaryRow label="Edad" value={`${formData.edad} anios`} />
                <SummaryRow label="Telefono" value={formData.telefono} />
                <SummaryRow label="Email" value={formData.email} />
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                <SummaryRow label="Direccion" value={formData.direccion} />
                <SummaryRow label="Ocupacion" value={formData.ocupacion} />
                <SummaryRow label="Estado civil" value={formData.estadoCivil} />
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                <SummaryRow label="Red asignada" value={redName} highlight />
              </div>

              {error && (
                <p className="text-[13px] px-3 py-2 rounded-lg" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => transition('datos')}
                  className="flex items-center justify-center w-12 h-12 rounded-xl transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--color-text-secondary, rgba(255,255,255,0.5))',
                    minHeight: '48px',
                    minWidth: '48px',
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={submit}
                  className="flex-1 py-4 rounded-xl text-[14px] font-semibold tracking-wide transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.9), rgba(201,168,76,0.7))',
                    color: '#fff',
                    minHeight: '48px',
                  }}
                >
                  Confirmar Registro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================== SENDING =================== */}
        {step === 'sending' && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
            <div className="text-center space-y-4">
              <Loader2
                className="w-8 h-8 animate-spin mx-auto"
                style={{ color: 'var(--color-accent-gold, #c9a84c)' }}
              />
              <p
                className="text-[14px] tracking-wide"
                style={{ color: 'var(--color-text-secondary, rgba(255,255,255,0.4))' }}
              >
                Registrando...
              </p>
            </div>
          </div>
        )}

        {/* =================== STEP 3: LISTO =================== */}
        {step === 'listo' && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
            <div className="max-w-lg text-center space-y-6">
              {/* Hero animated logo */}
              <div className="flex justify-center">
                <div
                  style={{
                    borderRadius: 24,
                    padding: 4,
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.45), rgba(201,168,76,0.08))',
                    animation: 'checkPop 0.5s ease-out',
                  }}
                >
                  <Logo size="xl" animated />
                </div>
              </div>

              <div className="space-y-2">
                <h2
                  className="text-[26px] font-bold"
                  style={{ color: 'var(--color-text-primary, #f0f0f5)' }}
                >
                  Bienvenido a GEDEONES, {formData.nombre.split(' ')[0]}
                </h2>
                <p
                  className="text-[14px] leading-relaxed max-w-sm mx-auto"
                  style={{ color: 'var(--color-text-secondary, rgba(255,255,255,0.5))' }}
                >
                  Tu lider de red se pondra en contacto contigo pronto.
                </p>
              </div>

              <div
                className="rounded-xl p-5 text-left space-y-2 max-w-xs mx-auto"
                style={{
                  background: 'var(--color-bg-surface, #12162a)',
                  border: '1px solid var(--color-border-subtle, rgba(255,255,255,0.06))',
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.3))' }}
                >
                  Red asignada
                </p>
                <p
                  className="text-[18px] font-semibold"
                  style={{ color: 'var(--color-accent-gold, #c9a84c)' }}
                >
                  {redName}
                </p>
              </div>

              {/* PWA install card */}
              <div
                className="w-full max-w-sm mx-auto rounded-2xl p-5 space-y-4"
                style={{
                  background: 'linear-gradient(160deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)',
                  border: '1px solid rgba(201,168,76,0.25)',
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Cross icon */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      width: 44,
                      height: 44,
                      background: 'rgba(201,168,76,0.12)',
                      border: '1px solid rgba(201,168,76,0.3)',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <rect x="12" y="2" width="4" height="24" rx="2" fill="#c9a84c" />
                      <rect x="4" y="10" width="20" height="4" rx="2" fill="#c9a84c" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="font-bold leading-tight"
                      style={{ color: '#c9a84c', fontSize: 15 }}
                    >
                      Agrega GEDEONES a tu pantalla
                    </p>
                    <p
                      className="leading-snug mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}
                    >
                      Accede con un solo toque, sin buscar
                    </p>
                  </div>
                </div>

                {/* iOS instructions */}
                <div className="space-y-2 text-left">
                  <p
                    className="font-semibold"
                    style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}
                  >
                    En iPhone / iPad (Safari):
                  </p>
                  <ol className="space-y-1.5 list-none">
                    {[
                      <>Toca el boton <span style={{ color: '#c9a84c' }}>⬆ Compartir</span> en la barra de Safari</>,
                      <>Selecciona <span style={{ color: '#c9a84c', fontWeight: 600 }}>&ldquo;Agregar a pantalla de inicio&rdquo;</span></>,
                      <>Toca <span style={{ color: '#c9a84c', fontWeight: 600 }}>&ldquo;Agregar&rdquo;</span> para confirmar</>,
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="flex-shrink-0 flex items-center justify-center rounded-full font-bold"
                          style={{
                            width: 22, height: 22,
                            background: 'rgba(201,168,76,0.15)',
                            border: '1px solid rgba(201,168,76,0.3)',
                            color: '#c9a84c',
                            fontSize: 12,
                            marginTop: 1,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: '1.5' }}>
                          {text}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div
                  className="text-center py-1 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 12,
                  }}
                >
                  En Android: toca el aviso de instalacion que aparece automaticamente
                </div>
              </div>

              <p
                className="text-[12px]"
                style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.25))' }}
              >
                Recibiras un email con tu acceso
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inline keyframes for check animation */}
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function InputField({ label, value, onChange, placeholder, type = 'text', icon: Icon }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div>
      <label
        className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.3))' }}
      >
        {Icon && <Icon size={12} />}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3.5 text-[14px] transition-all duration-150 outline-none"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--color-text-primary, #f0f0f5)',
          minHeight: '44px',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        }}
      />
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span
        className="text-[11px] uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted, rgba(255,255,255,0.25))' }}
      >
        {label}
      </span>
      <span
        className="text-[13px]"
        style={{
          color: highlight
            ? 'var(--color-accent-gold, #c9a84c)'
            : 'var(--color-text-secondary, rgba(255,255,255,0.6))',
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {value}
      </span>
    </div>
  )
}
