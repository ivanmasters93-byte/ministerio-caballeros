'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react'

type Step = 'welcome' | 'vision' | 'identity' | 'connect' | 'belong' | 'sending' | 'done'

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

const CIVIL_OPTIONS = ['Soltero', 'Casado', 'Divorciado', 'Viudo']

export default function RegistroHermanos() {
  const [step, setStep] = useState<Step>('welcome')
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
    }, 300)
  }

  const validate = (fields: (keyof FormData)[]) => {
    for (const f of fields) {
      if (!formData[f]?.trim()) {
        const labels: Record<string, string> = {
          nombre: 'nombre', edad: 'edad', telefono: 'telefono',
          email: 'email', direccion: 'direccion', ocupacion: 'ocupacion',
          estadoCivil: 'estado civil'
        }
        setError(`Completa tu ${labels[f] || f}`)
        return false
      }
    }
    if (fields.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email no valido')
      return false
    }
    if (fields.includes('edad')) {
      const age = parseInt(formData.edad)
      if (isNaN(age) || age < 18 || age > 100) {
        setError('Edad debe ser entre 18 y 100')
        return false
      }
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
      setTimeout(() => transition('done'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Intenta de nuevo')
      transition('belong')
    }
  }

  const redName = formData.red === 'MENOR' ? 'Red Menor' : formData.red === 'MEDIA' ? 'Red Media' : formData.red === 'MAYOR' ? 'Red Mayor' : ''
  const redRange = formData.red === 'MENOR' ? '18 — 30' : formData.red === 'MEDIA' ? '31 — 40' : formData.red === 'MAYOR' ? '41 — 75' : ''

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0e1a] text-white overflow-y-auto">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className={`relative z-10 transition-all duration-500 ease-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ═══════════════ WELCOME ═══════════════ */}
        {step === 'welcome' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="max-w-lg text-center space-y-8">
              {/* Cross mark */}
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto" />

              <div className="space-y-3">
                <p className="text-white/40 text-xs tracking-[0.4em] uppercase">Ministerio de Caballeros</p>
                <h1 className="text-5xl sm:text-7xl font-extralight tracking-tight">
                  GEDEONES
                </h1>
                <div className="w-12 h-px bg-amber-500/60 mx-auto" />
              </div>

              <p className="text-white/50 text-lg font-light leading-relaxed max-w-sm mx-auto">
                Una comunidad de hombres comprometidos con la fe, el servicio y el crecimiento espiritual.
              </p>

              <div className="grid grid-cols-3 gap-6 pt-4 max-w-xs mx-auto">
                <div className="text-center">
                  <p className="text-2xl font-light text-white/80">3</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Redes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-white/80">120+</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Hermanos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-white/80">1</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Familia</p>
                </div>
              </div>

              <button
                onClick={() => transition('vision')}
                className="group mt-8 flex flex-col items-center gap-2"
              >
                <span className="text-white/40 text-xs tracking-widest uppercase">Conoce mas</span>
                <ChevronDown className="w-5 h-5 text-white/30 group-hover:text-white/60 animate-bounce transition" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ VISION ═══════════════ */}
        {step === 'vision' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="max-w-lg space-y-12">
              <div className="space-y-6">
                <p className="text-amber-500/70 text-xs tracking-[0.3em] uppercase">Nuestra Vision</p>
                <h2 className="text-3xl sm:text-4xl font-extralight leading-snug">
                  Hombres que edifican<br />
                  <span className="text-white/50">hogares, iglesia y sociedad.</span>
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'Comunidad', desc: 'Reuniones semanales, retiros y eventos que fortalecen los lazos entre hermanos.' },
                  { title: 'Crecimiento', desc: 'Estudios biblicos, capacitaciones y recursos para tu desarrollo espiritual.' },
                  { title: 'Servicio', desc: 'Oportunidades de servir a otros y marcar una diferencia en tu entorno.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-px h-12 bg-amber-500/30 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-white/80">{item.title}</p>
                      <p className="text-sm text-white/35 leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button onClick={() => transition('welcome')} className="text-white/20 hover:text-white/50 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => transition('identity')}
                  className="flex-1 py-4 border border-white/10 rounded-xl text-sm tracking-wide text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.03] transition-all"
                >
                  Quiero ser parte
                  <ArrowRight className="w-4 h-4 inline ml-2 opacity-50" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ IDENTITY (personal data) ═══════════════ */}
        {step === 'identity' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
            <div className="w-full max-w-lg space-y-10">
              <div>
                <p className="text-amber-500/70 text-xs tracking-[0.3em] uppercase mb-3">Paso 1 de 3</p>
                <h2 className="text-2xl font-extralight">Cuentanos sobre ti</h2>
                <p className="text-white/30 text-sm mt-2">Tu informacion esta protegida y solo sera visible para el liderazgo.</p>
              </div>

              <div className="space-y-5">
                <InputField label="Nombre completo" value={formData.nombre} onChange={v => update('nombre', v)} placeholder="Tu nombre" />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Edad" value={formData.edad} onChange={v => update('edad', v)} placeholder="Ej: 28" type="number" />
                  <InputField label="Telefono" value={formData.telefono} onChange={v => update('telefono', v)} placeholder="+507..." type="tel" />
                </div>
                <InputField label="Email" value={formData.email} onChange={v => update('email', v)} placeholder="tu@email.com" type="email" />
              </div>

              {/* Auto-detected red */}
              {formData.red && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                  <p className="text-sm text-white/40">
                    Por tu edad, perteneces a la <span className="text-white/70 font-medium">{redName}</span> <span className="text-white/25">({redRange} anios)</span>
                  </p>
                </div>
              )}

              {error && <p className="text-red-400/80 text-sm">{error}</p>}

              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => transition('vision')} className="text-white/20 hover:text-white/50 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => validate(['nombre', 'edad', 'telefono', 'email']) && transition('connect')}
                  className="flex-1 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-sm tracking-wide text-white/70 hover:text-white hover:bg-white/[0.1] transition-all"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 inline ml-2 opacity-40" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CONNECT (additional data) ═══════════════ */}
        {step === 'connect' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
            <div className="w-full max-w-lg space-y-10">
              <div>
                <p className="text-amber-500/70 text-xs tracking-[0.3em] uppercase mb-3">Paso 2 de 3</p>
                <h2 className="text-2xl font-extralight">Un poco mas</h2>
                <p className="text-white/30 text-sm mt-2">Esto nos ayuda a conocerte mejor y conectarte con hermanos afines.</p>
              </div>

              <div className="space-y-5">
                <InputField label="Direccion" value={formData.direccion} onChange={v => update('direccion', v)} placeholder="Tu area o barrio" />
                <InputField label="Ocupacion" value={formData.ocupacion} onChange={v => update('ocupacion', v)} placeholder="A que te dedicas" />

                <div>
                  <label className="block text-[11px] text-white/30 uppercase tracking-wider mb-2">Estado civil</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CIVIL_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => update('estadoCivil', opt)}
                        className={`py-3 rounded-xl text-sm transition-all ${
                          formData.estadoCivil === opt
                            ? 'bg-white/10 border border-white/20 text-white'
                            : 'bg-white/[0.02] border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400/80 text-sm">{error}</p>}

              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => transition('identity')} className="text-white/20 hover:text-white/50 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => validate(['direccion', 'ocupacion', 'estadoCivil']) && transition('belong')}
                  className="flex-1 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-sm tracking-wide text-white/70 hover:text-white hover:bg-white/[0.1] transition-all"
                >
                  Casi listo
                  <ArrowRight className="w-4 h-4 inline ml-2 opacity-40" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ BELONG (confirm) ═══════════════ */}
        {step === 'belong' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
            <div className="w-full max-w-lg space-y-10">
              <div>
                <p className="text-amber-500/70 text-xs tracking-[0.3em] uppercase mb-3">Paso 3 de 3</p>
                <h2 className="text-2xl font-extralight">Confirma tus datos</h2>
              </div>

              <div className="space-y-3">
                <SummaryRow label="Nombre" value={formData.nombre} />
                <SummaryRow label="Edad" value={`${formData.edad} anios`} />
                <SummaryRow label="Telefono" value={formData.telefono} />
                <SummaryRow label="Email" value={formData.email} />
                <div className="w-full h-px bg-white/[0.05] my-1" />
                <SummaryRow label="Direccion" value={formData.direccion} />
                <SummaryRow label="Ocupacion" value={formData.ocupacion} />
                <SummaryRow label="Estado civil" value={formData.estadoCivil} />
                <div className="w-full h-px bg-white/[0.05] my-1" />
                <SummaryRow label="Red asignada" value={`${redName} (${redRange})`} highlight />
              </div>

              {error && <p className="text-red-400/80 text-sm">{error}</p>}

              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => transition('connect')} className="text-white/20 hover:text-white/50 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={submit}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-600/80 to-amber-500/80 rounded-xl text-sm font-medium tracking-wide text-white hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-900/20"
                >
                  Unirme a GEDEONES
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ SENDING ═══════════════ */}
        {step === 'sending' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="text-center space-y-6">
              <Loader2 className="w-8 h-8 text-amber-500/60 animate-spin mx-auto" />
              <p className="text-white/40 text-sm tracking-wide">Registrando...</p>
            </div>
          </div>
        )}

        {/* ═══════════════ DONE ═══════════════ */}
        {step === 'done' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="max-w-lg text-center space-y-8">
              <div className="w-16 h-16 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-green-400" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-extralight">Bienvenido, {formData.nombre.split(' ')[0]}</h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
                  Ya formas parte de GEDEONES. Tu lider de red se pondra en contacto contigo pronto.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left space-y-3 max-w-xs mx-auto">
                <p className="text-[11px] text-white/30 uppercase tracking-wider">Tu red</p>
                <p className="text-lg font-light text-white/80">{redName}</p>
                <p className="text-sm text-white/30">{redRange} anios</p>
              </div>

              <p className="text-white/20 text-xs">
                Revisa tu email para acceder a la plataforma
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subtle progress dots */}
      {!['welcome', 'sending', 'done'].includes(step) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {['vision', 'identity', 'connect', 'belong'].map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s === step ? 'w-6 bg-amber-500/50' : i < ['vision', 'identity', 'connect', 'belong'].indexOf(step) ? 'w-1.5 bg-white/20' : 'w-1.5 bg-white/[0.06]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div>
      <label className="block text-[11px] text-white/30 uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
      />
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[11px] text-white/25 uppercase tracking-wider">{label}</span>
      <span className={`text-sm ${highlight ? 'text-amber-400/80 font-medium' : 'text-white/60'}`}>{value}</span>
    </div>
  )
}
