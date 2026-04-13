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
        background: '#060810',
        color: 'var(--color-text-primary, #f0f0f5)',
      }}
    >
      {/* === ANTIGRAVITY BACKGROUND === */}
      {/* Radial gold nebula */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Floating watermark logo — hero size gold transparent with glow */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="antigravity-float" style={{ opacity: 0.12 }}>
          <div
            style={{
              filter: 'drop-shadow(0 0 60px rgba(201,168,76,0.4)) drop-shadow(0 0 120px rgba(201,168,76,0.2))',
            }}
          >
            <Logo size={400} variant="gold" />
          </div>
        </div>
      </div>
      {/* Floating gold particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="antigravity-particle"
            style={{
              position: 'absolute',
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.4)',
              left: `${12 + i * 11}%`,
              bottom: '-10px',
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
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
            <Logo size={48} variant="gold" animated />
            <div>
              <p
                className="text-[9px] tracking-[0.35em] uppercase"
                style={{ color: 'rgba(201,168,76,0.6)' }}
              >
                Ministerio de Caballeros
              </p>
              <h1
                className="text-[18px] font-bold tracking-wider gold-text"
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

              {/* WhatsApp info — hermanos interact via WhatsApp, not the app */}
              <div
                className="w-full max-w-sm mx-auto rounded-2xl p-6 text-center"
                style={{
                  background: 'linear-gradient(160deg, rgba(37,211,102,0.08) 0%, rgba(37,211,102,0.02) 100%)',
                  border: '1px solid rgba(37,211,102,0.2)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(37,211,102,0.15)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.21l-.304-.18-2.867.852.852-2.867-.18-.304A8 8 0 1112 20z"/>
                  </svg>
                </div>
                <p
                  className="text-[15px] font-semibold mb-1"
                  style={{ color: '#25D366' }}
                >
                  Tu lider te contactara por WhatsApp
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  Toda la informacion del ministerio la recibiras por WhatsApp. No necesitas descargar nada mas.
                </p>
              </div>

              <p
                className="text-[12px]"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                Ya puedes cerrar esta pagina
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Antigravity keyframes */}
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes antigravityFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        @keyframes particleRise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        .antigravity-float {
          animation: antigravityFloat 6s ease-in-out infinite;
        }
        .antigravity-particle {
          animation: particleRise 10s ease-in-out infinite;
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
