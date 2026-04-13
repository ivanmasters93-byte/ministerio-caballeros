'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import Image from 'next/image'

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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'var(--color-bg-base)',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)',
      }}
    >
      {/* Large watermark logo behind everything */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.025,
          pointerEvents: 'none',
          zIndex: 0,
          width: 480,
          height: 480,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/logo-gedeones.jpg"
          alt=""
          width={480}
          height={480}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Hero logo area */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Logo size="hero" animated />
          </div>
          <h1
            className="text-4xl font-bold gold-text tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            GEDEONES GP
          </h1>
          <p
            className="text-sm tracking-[0.3em] uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Ministerio de Caballeros
          </p>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.06)',
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
        </div>
      </div>
    </div>
  )
}
