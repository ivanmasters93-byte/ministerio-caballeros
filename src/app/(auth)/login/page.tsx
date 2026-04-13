'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cross } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Credenciales incorrectas. Intenta nuevamente.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'var(--color-bg-base)',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'var(--color-accent-gold-soft)',
              border: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            <Cross size={28} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
          <h1
            className="text-3xl font-bold gold-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            GEDEONES
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg">
            Ministerio de Caballeros
          </p>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Iniciar Sesion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  background: 'var(--color-accent-red-soft)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  color: 'var(--color-accent-red)',
                }}
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando sesion...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
            Demo: admin@gedeones.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
