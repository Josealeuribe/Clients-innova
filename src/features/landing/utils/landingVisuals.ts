import type { CSSProperties } from 'react'

const SUIT_TOP = [12, 78, 12, 78] as const
const SUIT_LEFT = [-2, -3, 100, 101] as const

export function getStarStyle(index: number): CSSProperties {
  const size = index % 3 === 0 ? 3 : 2

  return {
    width: size,
    height: size,
    left: `${(index * 23 + 7) % 95}%`,
    top: `${(index * 17 + 5) % 80}%`,
    opacity: 0.3 + (index % 4) * 0.1,
    animation: `flicker-star ${2 + (index % 4)}s ease-in-out infinite`,
    animationDelay: `${index * 0.4}s`,
  }
}

export function getSuitStyle(index: number): CSSProperties {
  return {
    color: index % 2 === 0 ? '#D4AF37' : '#8B1A1A',
    top: `${SUIT_TOP[index]}%`,
    left: `${SUIT_LEFT[index]}%`,
    animation: `float-gentle ${3 + index * 0.5}s ease-in-out infinite`,
    animationDelay: `${index * 0.7}s`,
    opacity: 0.72,
  }
}

export const goldTextStyle: CSSProperties = {
  background:
    'linear-gradient(135deg, #F0C847 0%, #D4AF37 40%, #A0832A 70%, #D4AF37 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'gold-shimmer 4s linear infinite',
}

export const primaryButtonStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
  letterSpacing: '0.08em',
  animation: 'pulse-glow 2.5s ease-in-out infinite',
}
