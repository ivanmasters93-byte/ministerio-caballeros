'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Lock, Check, AlertTriangle } from 'lucide-react'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="text-center py-8">
        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-accent-red)' }} />
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Enlace invalido
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Este enlace no es valido. Solicita uno nuevo.
        </p>
        <Link href="/forgot-password" className="text-sm font-medium" style={{ color: 'var(--color-accent-gold)' }}>
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contrasenas no coinciden')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Error al restablecer')
      }
    } catch {
      setError('Error de conexion')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(74, 222, 128, 0.15)' }}>
          <Check size={32} style={{ color: 'rgb(74, 222, 128)' }} />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Contrasena actualizada
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Tu contrasena ha sido restablecida. Ya puedes iniciar sesion.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #d4a843, #c9a84c)', color: '#0a0e1a' }}
        >
          Iniciar sesion
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Nueva contrasena
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Nueva contrasena
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              required
              className="w-full h-11 pl-10 pr-4 text-sm rounded-xl outline-none transition-all"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Confirmar contrasena
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repite la contrasena"
              required
              className="w-full h-11 pl-10 pr-4 text-sm rounded-xl outline-none transition-all"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--color-accent-red-soft)', color: 'var(--color-accent-red)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-50 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #d4a843, #c9a84c, #b8963f)', color: '#0a0e1a', border: 'none' }}
        >
          {loading ? 'Guardando...' : 'Restablecer contrasena'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg-base)', backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo size={80} animated /></div>
          <h1 className="text-2xl font-bold gold-text tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>GEDEONES GP</h1>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}>
          <Suspense fallback={<div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Cargando...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
