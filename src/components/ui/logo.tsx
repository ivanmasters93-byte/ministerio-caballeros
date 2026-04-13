import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 36, className }: LogoProps) {
  return (
    <Image
      src="/logo-gedeones.jpg"
      alt="GEDEONES GP"
      width={size}
      height={size}
      className={`rounded-lg object-cover ${className || ''}`}
      priority
    />
  )
}
