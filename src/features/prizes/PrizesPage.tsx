import type { Page } from '@/shared/types/navigation'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
import { PRIZES } from '@/shared/data/prizes'

interface Props {
  navigate: (page: Page) => void
}

export default function PrizesPage({ navigate }: Props) {
  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">CATÁLOGO DE PREMIOS</p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-2">Premios de la Ruleta</h1>
        <p className="text-[#9A7B50] text-sm mb-12 max-w-2xl">
          Estos son todos los bonos y cortesías que puedes ganar al girar la ruleta de bienvenida. Ningún premio se
          entrega en efectivo ni por transferencia: todos son redimibles únicamente en cualquiera de nuestras 3
          sedes de Gran Casino Cúcuta, completando tu registro.
        </p>

        {/* LA FICHA DE CADA PREMIO, EN BLOQUES
            Cabecera con el ícono y el tipo (un bono es dinero de juego y una
            cortesía no), el nombre del premio y su descripción. El tipo importa
            lo suficiente para tener su propio sitio y no ir escondido en el
            texto. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRIZES.map((prize) => (
            <div
              key={prize.clave}
              className="flex flex-col rounded-2xl border border-[#D4AF37]/20 p-6 transition-all hover:border-[#D4AF37]/45"
              style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
            >
              {/* Cabecera: el ícono y el tipo en la misma línea. El tipo importa
                  — un bono es dinero de juego y una cortesía no. */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <prize.icon size={32} className="flex-shrink-0 text-[#D4AF37]" />
                <span
                  className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider"
                  style={{
                    color: prize.monetary ? '#D4AF37' : '#9A7B50',
                    background: prize.monetary ? 'rgba(212,175,55,0.12)' : 'rgba(154,123,80,0.12)',
                  }}
                >
                  {prize.monetary ? 'BONO' : 'CORTESÍA'}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold leading-tight text-[#F5E6C8]">{prize.prize}</h3>
              <p className="text-sm leading-relaxed text-[#9A7B50]">{prize.detail}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-[#6B5D3F] text-xs mb-4">¿Ya tienes un bono ganado? Ingresa a tu cuenta para verlo.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate('roulette')}
              className="px-10 py-4 rounded-full text-[#0a0805] font-bold text-base tracking-wide transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
                letterSpacing: '0.08em',
              }}
            >
              Girar la Ruleta
            </button>
            <button
              type="button"
              onClick={() => navigate('login')}
              className="px-10 py-4 rounded-full font-semibold text-base text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all"
              style={{ letterSpacing: '0.06em' }}
            >
              Ver mi Bono
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto -mx-4 sm:-mx-6 lg:-mx-8 pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
