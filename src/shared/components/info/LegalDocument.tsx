import { useEffect, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Panel } from './InfoPageShell'

export interface SeccionLegal {
  id: string
  title: string
  body: ReactNode
  icon: LucideIcon
  /** Secciones que el usuario no debería pasar por alto. */
  highlight?: boolean
}

interface Props {
  secciones: SeccionLegal[]
}

// Documento legal con índice lateral fijo (en escritorio) que marca la sección
// que se está leyendo. En celular el índice va arriba como fila desplazable.
export default function LegalDocument({ secciones }: Props) {
  const [activa, setActiva] = useState(secciones[0]?.id)

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiva(visible.target.id)
      },
      // Cuenta como "leyendo" la franja superior de la pantalla, bajo el navbar.
      { rootMargin: '-120px 0px -60% 0px' },
    )
    secciones.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observador.observe(el)
    })
    return () => observador.disconnect()
  }, [secciones])

  const ir = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      {/* ---------- Índice ---------- */}
      <nav aria-label="Contenido" className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-3 hidden text-[10px] font-extrabold tracking-[0.25em] text-[#D4AF37] lg:block">CONTENIDO</p>
        <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {secciones.map((s, i) => {
            const on = s.id === activa
            return (
              <li key={s.id} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => ir(s.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-all lg:text-sm ${
                    on
                      ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 font-semibold text-[#F0C847]'
                      : 'border-transparent text-[#9A7B50] hover:border-[#D4AF37]/20 hover:text-[#C4A97A]'
                  }`}
                >
                  <span className={`font-display text-sm font-black ${on ? 'text-[#F0C847]' : 'text-[#6B5D3F]'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="whitespace-nowrap lg:whitespace-normal">{s.title}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* ---------- Secciones ---------- */}
      <div className="flex flex-col gap-5">
        {secciones.map((s, i) => {
          const Icono = s.icon
          return (
            <Panel key={s.id} id={s.id} tono={s.highlight ? 'oro' : 'normal'}>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/8 text-[#F0C847]">
                    <Icono size={20} />
                  </span>
                  <span className="font-display text-xs font-black text-[#6B5D3F]">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display mb-2 text-xl font-bold text-[#F5E6C8] sm:text-2xl">{s.title}</h2>
                  <div className="space-y-3 text-sm leading-relaxed text-[#C4A97A]">{s.body}</div>
                </div>
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
