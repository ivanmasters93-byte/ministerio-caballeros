import Image from 'next/image'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero'

const SIZE_MAP: Record<LogoSize, number> = {
  sm: 28,
  md: 40,
  lg: 64,
  xl: 96,
  hero: 140,
}

interface LogoProps {
  size?: number | LogoSize
  className?: string
  animated?: boolean
  withText?: boolean
  textBelow?: boolean
}

export function Logo({ size = 'md', className, animated = false, withText = false, textBelow = false }: LogoProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size]

  const img = (
    <Image
      src="/logo-gedeones.jpg"
      alt="GEDEONES GP"
      width={px}
      height={px}
      className={`rounded-xl object-cover flex-shrink-0 ${animated ? 'logo-glow' : ''} ${className || ''}`}
      style={{ width: px, height: px }}
      priority
    />
  )

  if (!withText) return img

  if (textBelow) {
    return (
      <div className="flex flex-col items-center gap-2">
        {img}
        <div className="text-center">
          <p
            className="font-bold tracking-widest gold-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: Math.max(12, Math.round(px * 0.18)),
              lineHeight: 1.2,
            }}
          >
            GEDEONES GP
          </p>
          <p
            className="tracking-wider uppercase"
            style={{
              color: 'var(--color-text-muted)',
              fontSize: Math.max(9, Math.round(px * 0.1)),
              letterSpacing: '0.2em',
              marginTop: 2,
            }}
          >
            Ministerio de Caballeros
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {img}
      <div className="min-w-0">
        <p
          className="font-bold tracking-wide leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
            fontSize: Math.max(11, Math.round(px * 0.32)),
          }}
        >
          GEDEONES GP
        </p>
        <p
          className="leading-tight"
          style={{
            color: 'var(--color-text-muted)',
            fontSize: Math.max(9, Math.round(px * 0.22)),
          }}
        >
          Ministerio de Caballeros
        </p>
      </div>
    </div>
  )
}
