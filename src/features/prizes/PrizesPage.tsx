import { Banknote, MapPin, ShieldCheck } from 'lucide-react'
import type { Page } from '@/shared/types/navigation'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
import { PRIZES } from '@/shared/data/prizes'
import { useVigencias } from '@/shared/hooks/useVigencias'
import PrizeTicket from '@/features/landing/components/PrizeTicket'
import { landingService } from '@/features/landing/services/landing.service'
import CuponesShowcase from './components/CuponesShowcase'

interface Props {
  navigate: (page: Page) => void
}

const CLAVE_MAYOR = 'bono-50000'

const GARANTIAS = [
  { icono: Banknote, texto: 'Solo bonos de juego' },
  { icono: MapPin, texto: 'Redimibles en nuestras 3 sedes' },
  { icono: ShieldCheck, texto: 'Sin efectivo ni transferencias' },
]

export default function PrizesPage({ navigate }: Props) {
  // La fecha de cada boleto sale de la base, igual que en Gira y Gana.
  const { datos: vigencias } = useVigencias()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent pt-28 pb-20 md:pt-32">
      {/* Resplandor de fondo, rojo casino y oro, muy tenue. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 35% at 50% 0%, rgba(139,26,26,0.28), transparent 70%), radial-gradient(40% 30% at 85% 45%, rgba(212,175,55,0.08), transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8">
          <BackButton />
        </div>

        {/* ---------- Encabezado ---------- */}
        <header className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
            <span className="text-[#B52020]">♦</span> CATÁLOGO DE PREMIOS <span className="text-[#B52020]">♥</span>
          </p>
          <h1 className="font-display mb-4 text-4xl leading-tight font-black text-[#F5E6C8] md:text-6xl">
            Premios de la{' '}
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
              Ruleta
            </span>
          </h1>
          <div className="mx-auto mb-5 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#C4A97A] md:text-base">
            Estos son los bonos que puedes ganar en la tragamonedas de bienvenida. Completa tu registro y redímelos en
            caja con tu cédula en cualquiera de las sedes de Gran Casino Cúcuta.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {GARANTIAS.map(({ icono: Icono, texto }) => (
              <span
                key={texto}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/[0.05] px-4 py-1.5 text-xs font-semibold text-[#E8DCC4]"
              >
                <Icono size={14} className="text-[#D4AF37]" />
                {texto}
              </span>
            ))}
          </div>
        </header>

        {/* ---------- Los 3 boletos en línea ----------
            Es el mismo boleto de Gira y Gana. En tres columnas cada uno queda
            angosto y el talón dorado pasa solo a una franja debajo (el boleto
            decide su forma por su propio ancho, ver PrizeTicket). */}
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {PRIZES.map((prize) => (
            <PrizeTicket
              key={prize.clave}
              prize={prize}
              tag={landingService.getMarketingTag(prize.clave)}
              vigencia={vigencias?.vigencias.find((v) => v.clave === prize.clave) ?? null}
              destacado={prize.clave === CLAVE_MAYOR}
              onRoulette={() => navigate('roulette')}
              onComoFunciona={() => navigate('how-it-works')}
            />
          ))}
        </div>

        {/* ---------- Cupones ---------- */}
        <div className="mt-24">
          <CuponesShowcase />
        </div>

        {/* ---------- Llamado final ---------- */}
        <div className="mt-20 text-center">
          <p className="mb-5 text-sm text-[#9A7B50]">¿Ya tienes un bono ganado? Ingresa a tu cuenta para verlo.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('roulette')}
              className="rounded-full px-10 py-4 text-base font-bold tracking-wide text-[#0a0805] transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
                letterSpacing: '0.08em',
                animation: 'pulse-glow 2.5s ease-in-out infinite',
              }}
            >
              ✦ Jugar ahora ✦
            </button>
            <button
              type="button"
              onClick={() => navigate('login')}
              className="rounded-full border border-[#D4AF37]/40 px-10 py-4 text-base font-semibold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10"
              style={{ letterSpacing: '0.06em' }}
            >
              Ver mi Bono
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
