import type { ReactNode } from 'react'
import type { Page } from '@/shared/types/navigation'
import Footer from '@/shared/components/Footer'

interface Props {
  navigate: (page: Page) => void
  /** Botón de volver (BackButton o LegalBackButton, según la vista). */
  back: ReactNode
  children: ReactNode
  /** Ancho del contenido. Las vistas de lectura van más angostas. */
  ancho?: 'lectura' | 'amplio'
}

// Marco común de las vistas informativas: resplandor de fondo rojo y oro,
// ancho de contenido y pie de página.
export default function InfoPageShell({ navigate, back, children, ancho = 'amplio' }: Props) {
  return (
    // `overflow-x-clip` y no `overflow-hidden`: hidden convierte esto en un
    // contenedor de scroll y anula el índice `sticky` de los documentos legales
    // (mismo problema documentado en shared/styles/index.css).
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-transparent pt-28 pb-20 md:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 30% at 50% 0%, rgba(139,26,26,0.28), transparent 70%), radial-gradient(35% 30% at 90% 40%, rgba(212,175,55,0.08), transparent 70%), radial-gradient(35% 30% at 5% 70%, rgba(139,26,26,0.10), transparent 70%)',
        }}
      />

      <div
        className={`relative mx-auto w-full px-4 sm:px-6 lg:px-10 ${ancho === 'lectura' ? 'max-w-6xl' : 'max-w-[1400px]'}`}
      >
        <div className="mb-8">{back}</div>
        {children}
      </div>

      <div className="mt-auto pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}

// Tarjeta con el mismo fondo de los boletos (oscuro, rayado, borde punteado).
export function Panel({
  children,
  className = '',
  tono = 'normal',
  id,
}: {
  children: ReactNode
  className?: string
  /** `alerta` usa el rojo casino; `oro` resalta con dorado. */
  tono?: 'normal' | 'oro' | 'alerta'
  id?: string
}) {
  const borde = tono === 'alerta' ? 'border-[#B52020]/45' : tono === 'oro' ? 'border-[#D4AF37]/45' : 'border-[#D4AF37]/20'
  const resplandor =
    tono === 'alerta'
      ? 'radial-gradient(90% 80% at 0% 0%, rgba(181,32,32,0.18), transparent 60%)'
      : tono === 'oro'
        ? 'radial-gradient(90% 80% at 0% 0%, rgba(212,175,55,0.14), transparent 60%)'
        : 'radial-gradient(90% 80% at 0% 0%, rgba(212,175,55,0.06), transparent 60%)'

  return (
    <section
      id={id}
      className={`scroll-mt-28 rounded-2xl border p-1.5 ${borde} ${className}`}
      style={{
        backgroundColor: '#15120B',
        backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.016) 0 2px, transparent 2px 7px), ${resplandor}`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
      }}
    >
      <div className="h-full rounded-[12px] border border-dashed border-[#D4AF37]/15 p-5 sm:p-6">{children}</div>
    </section>
  )
}
