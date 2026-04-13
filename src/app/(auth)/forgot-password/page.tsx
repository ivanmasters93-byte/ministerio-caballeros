'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ArrowLeft, Mail, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Error al enviar')
      }
    } catch {
      setError('Error de conexion')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'var(--color-bg-base)',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={80} animated />
          </div>
          <h1 className="text-2xl font-bold gold-text tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
            GEDEONES GP
          </h1>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
          }}
        >
          {sent ? (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(74, 222, 128, 0.15)' }}
              >
                <Check size={32} style={{ color: 'rgb(74, 222, 128)' }} />
              </div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Correo enviado
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Si <strong style={{ color: 'var(--color-text-secondary)' }}>{email}</strong> esta registrado, recibiras un enlace para restablecer tu contrasena. Revisa tu bandeja de entrada y spam.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--color-accent-gold)' }}
              >
                <ArrowLeft size={16} />
                Volver al inicio de sesion
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Link href="/login" style={{ color: 'var(--color-text-muted)' }}>
                  <ArrowLeft size={20} />
                </Link>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Recuperar contrasena
                </h2>
              </div>

              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Ingresa tu correo electronico y te enviaremos un enlace para restablecer tu contrasena.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Correo electronico
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tucorreo@gmail.com"
                      required
                      className="w-full h-11 pl-10 pr-4 text-sm rounded-xl outline-none transition-all"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '' }}
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className="px-4 py-3 rounded-lg text-sm"
                    style={{ background: 'var(--color-accent-red-soft)', color: 'var(--color-accent-red)' }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-11 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-50 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #d4a843, #c9a84c, #b8963f)',
                    color: '#0a0e1a',
                    border: 'none',
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
