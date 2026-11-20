import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Coins, CupSoda, Expand, GlassWater, LayoutGrid, Sandwich, Ticket, Users } from 'lucide-react'
import cupones from '@/shared/assets/images/cupones-cucuta-redimir.webp'
import { VisorCupones } from '@/features/landing/components/CuponesCard'

// Los cupones del afiche, en texto: el afiche es una imagen y no se puede leer
// con lector de pantalla ni buscar, asi que lo esencial se repite aqui.
const CUPONES: { icono: LucideIcon; texto: string }[] = [
  { icono: Coins, texto: 'Bono por $10.000 en créditos' },
  { icono: Users, texto: 'Trae un amigo y gana partida doble' },
  { icono: Sandwich, texto: 'Un sándwich' },
  { icono: CupSoda, texto: 'Soda especial de la casa' },
  { icono: GlassWater, texto: 'Limonada de coco' },
  { icono: Ticket, texto: '5 boletas' },
  { icono: LayoutGrid, texto: 'Cartón doble de bingo' },
]

// Vista amplia de los cupones de cliente frecuente para la pagina de Premios.
// En Gira y Gana va la tarjeta compacta (CuponesCard); aqui hay espacio para
// mostrar el afiche nitido y la lista completa.
export default function CuponesShowcase() {
  const [abierto, setAbierto] = useState(false)

  return (
    <section
      className="relative overflow-hidden rounded-[26px] border border-[#D4AF37]/25 p-2"
      style={{
        backgroundColor: '#15120B',
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 7px), radial-gradient(60% 80% at 0% 0%, rgba(139,26,26,0.22), transparent 70%), radial-gradient(50% 70% at 100% 100%, rgba(212,175,55,0.12), transparent 70%)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
      }}
    >
      <div className="grid items-center gap-8 rounded-[20px] border border-dashed border-[#D4AF37]/20 p-6 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12 lg:p-10">
        {/* ---------- Texto ---------- */}
        <div>
          <span
            className="mb-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-[#1a1408]"
            style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37)' }}
          >
            <Ticket size={12} />
            CLIENTE FRECUENTE
          </span>

          <h2 className="font-display mb-3 text-4xl leading-[1.05] font-black text-[#F5E6C8] sm:text-5xl">
            Vuélvete un{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #F0C847, #D4AF37 55%, #A0832A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              cliente frecuente
            </span>
          </h2>
          <p className="mb-6 max-w-lg text-sm leading-relaxed text-[#C4A97A] sm:text-base">
            Más visitas, más premios. Cada vez que vuelves a cualquiera de nuestras sedes puedes redimir un cupón y
            seguir sumando beneficios.
          </p>

          <ul className="mb-7 grid gap-2.5 sm:grid-cols-2">
            {CUPONES.map(({ icono: Icono, texto }) => (
              <li
                key={texto}
                className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.04] px-3.5 py-2.5"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/12 text-[#F0C847]">
                  <Icono size={16} />
                </span>
                <span className="text-sm font-semibold text-[#F5E6C8]">{texto}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#B52020]/50 bg-[#B52020]/10 px-4 py-2 text-xs font-bold text-[#F5E6C8]">
              <span className="text-[#B52020]">♦</span>
              Redime 1 cupón por día
            </span>
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 px-5 py-2 text-xs font-bold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10"
            >
              <Expand size={14} />
              Ver afiche completo
            </button>
          </div>
          <p className="mt-4 text-[11px] text-[#6B5D3F]">Aplican términos y condiciones. Consulta condiciones en caja.</p>
        </div>

        {/* ---------- Afiche ---------- */}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Ampliar el afiche de cupones"
          className="group relative block overflow-hidden rounded-2xl border border-[#D4AF37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(212,175,55,0.15)] transition-transform duration-500 hover:-translate-y-1 lg:rotate-[1.2deg] lg:hover:rotate-0"
        >
          <img
            src={cupones}
            alt="Redime tus cupones y aprovecha cada beneficio"
            loading="lazy"
            decoding="async"
            className="block w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#0a0805]/75 px-3 py-1.5 text-[11px] font-bold text-[#F0C847] opacity-0 transition-opacity group-hover:opacity-100">
            <Expand size={12} />
            Ampliar
          </span>
        </button>
      </div>

      {abierto && <VisorCupones onClose={() => setAbierto(false)} />}
    </section>
  )
}
