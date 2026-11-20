import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  eyebrow: string
  /** Texto del título antes de la palabra dorada. */
  title: string
  /** Palabra o frase final del título, en dorado con brillo. */
  highlight?: string
  subtitle?: ReactNode
  icon?: LucideIcon
  /** Contenido extra bajo el subtítulo (etiquetas, botones...). */
  children?: ReactNode
}

// Encabezado común de las vistas informativas (términos, privacidad, juego
// responsable, preguntas frecuentes, cómo funciona). Mismo lenguaje visual que
// Premios y Gira y Gana: serif display, palabra final dorada, rombos rojos.
export default function PageHero({ eyebrow, title, highlight, subtitle, icon: Icon, children }: Props) {
  return (
    <header className="mb-12 text-center md:mb-16">
      {Icon && (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37 50%, #A0832A)' }}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#121009]">
            <Icon size={28} className="text-[#F0C847]" />
          </div>
        </div>
      )}
      <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
        <span className="text-[#B52020]">♦</span> {eyebrow} <span className="text-[#B52020]">♥</span>
      </p>
      <h1 className="font-display mb-4 text-4xl leading-tight font-black text-[#F5E6C8] md:text-6xl">
        {title}
        {highlight && (
          <>
            {' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #F0C847 0%, #D4AF37 40%, #A0832A 70%, #D4AF37 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gold-shimmer 4s linear infinite',
              }}
            >
              {highlight}
            </span>
          </>
        )}
      </h1>
      <div className="mx-auto mb-5 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      {subtitle && <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#C4A97A] md:text-base">{subtitle}</p>}
      {children && <div className="mt-6">{children}</div>}
    </header>
  )
}
