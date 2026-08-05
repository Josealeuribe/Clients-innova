import type { Page } from '@/shared/types/navigation'
import { Sparkles, Spade, Heart, Diamond, Club } from 'lucide-react'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
import Roulette3D from '../roulette/components/Roulette3D'
import { PRIZES } from '@/shared/data/prizes'
import { MarqueeBanner } from '../banner/MarqueeBanner'

interface Props {
  navigate: (page: Page) => void
}

// Etiqueta de marketing puramente cosmética.
// No afecta el sorteo ni el catálogo real.
const MARKETING_TAG: Record<string, string> = {
  'bono-5000': 'FÁCIL DE GANAR',
  'bono-10000': 'MÁS COMÚN',
  'bono-20000': 'MÁS POPULAR',
  'bono-50000': 'PREMIO MAYOR',
  'carton-bingo': 'NUEVO',
  'entrada-evento': 'VIP',
  'giro-extra': 'BONUS',
  'premio-sorpresa': 'PREMIUM',
}

const steps = [
  {
    num: '01',
    title: 'Gira la Ruleta',
    desc: 'Presiona el botón y participa en nuestra promoción de bienvenida. Es gratis y no requiere registro previo.',
  },
  {
    num: '02',
    title: 'Descubre tu Premio',
    desc: 'La ruleta se detiene y revela el beneficio exclusivo que tenemos preparado para ti.',
  },
  {
    num: '03',
    title: 'Regístrate y Reclámalo',
    desc: 'Completa tus datos en minutos. Tu premio queda reservado mientras lo reclamas.',
  },
]

function WheelPreview3D() {
  return (
    <div className="relative h-[300px] w-[min(88vw,520px)] sm:h-[360px] lg:h-[420px]">
      <Roulette3D
        preview
        quality="medium"
        className="h-full w-full"
      />

      {[Spade, Heart, Diamond, Club].map((Suit, index) => (
        <div
          key={index}
          className="pointer-events-none absolute"
          style={{
            color: index % 2 === 0 ? '#D4AF37' : '#8B1A1A',
            top: `${[12, 78, 12, 78][index]}%`,
            left: `${[-2, -3, 100, 101][index]}%`,
            animation: `float-gentle ${3 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${index * 0.7}s`,
            opacity: 0.72,
          }}
        >
          <Suit size={20} fill="currentColor" />
        </div>
      ))}
    </div>
  )
}

export default function LandingPage({ navigate }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {/* HERO PRINCIPAL */}
      {/* HERO PRINCIPAL */}
      <section className="relative overflow-hidden pb-0 pt-20 md:pt-24">
        {/* Estrellas decorativas */}
        {Array.from({ length: 18 }, (_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{
              width: index % 3 === 0 ? 3 : 2,
              height: index % 3 === 0 ? 3 : 2,
              left: `${(index * 23 + 7) % 95}%`,
              top: `${(index * 17 + 5) % 80}%`,
              opacity: 0.3 + (index % 4) * 0.1,
              animation: `flicker-star ${2 + (index % 4)
                }s ease-in-out infinite`,
              animationDelay: `${index * 0.4}s`,
            }}
          />
        ))}

        {/* Marquesina pegada debajo del navbar */}
        <div className="relative z-30 w-full">
          <MarqueeBanner />
        </div>

        {/* Botón Volver con separación respecto a la marquesina */}
        <div className="relative z-20 mx-auto max-w-7xl px-6 pt-10 md:pt-14">
          <BackButton />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid min-h-[calc(100vh-220px)] items-center gap-6 py-8 md:grid-cols-2 md:py-6 lg:gap-10">
            {/* Texto */}
            <div
              className="z-10 text-center md:text-left"
              style={{
                animation: 'slide-up 0.8s ease-out forwards',
              }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/8 px-4 py-1.5">
                <Sparkles size={14} className="text-[#D4AF37]" />

                <span className="text-xs font-bold tracking-widest text-[#D4AF37]">
                  PROMOCIÓN EXCLUSIVA
                </span>

                <Sparkles size={14} className="text-[#D4AF37]" />
              </div>

              <h1 className="mb-5 leading-none">
                <span
                  className="block text-5xl font-black md:text-6xl lg:text-7xl"
                  style={{
                    background:
                      'linear-gradient(135deg, #F0C847 0%, #D4AF37 40%, #A0832A 70%, #D4AF37 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gold-shimmer 4s linear infinite',
                  }}
                >
                  Gira,
                </span>

                <span className="block text-5xl font-black text-[#F5E6C8] md:text-6xl lg:text-7xl">
                  gana y
                </span>

                <span
                  className="block text-5xl font-black md:text-6xl lg:text-7xl"
                  style={{
                    background:
                      'linear-gradient(135deg, #F0C847 0%, #D4AF37 40%, #A0832A 70%, #D4AF37 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gold-shimmer 4s linear infinite',
                    animationDelay: '0.5s',
                  }}
                >
                  disfruta.
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-[#C4A97A] md:mx-0 md:text-xl">
                Participa en nuestra promoción de bienvenida, gira la ruleta y
                descubre beneficios exclusivos para disfrutar en Gran Casino Cúcuta.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <button
                  type="button"
                  onClick={() => navigate('roulette')}
                  className="rounded-full px-8 py-4 text-base font-bold tracking-wide text-[#0a0805] transition-all hover:scale-105 active:scale-95"
                  style={{
                    background:
                      'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
                    animation: 'pulse-glow 2.5s ease-in-out infinite',
                    letterSpacing: '0.08em',
                  }}
                >
                  Gira y gana
                </button>

                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="rounded-full border border-[#D4AF37]/40 px-8 py-4 text-base font-semibold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10"
                  style={{
                    letterSpacing: '0.06em',
                  }}
                >
                  Ya tengo cuenta
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-[#6B5D3F] md:text-left">
                Aplican términos y condiciones. Solo para mayores de 18 años.
              </p>
            </div>

            {/* Ruleta */}
            <div className="relative flex items-center justify-center md:-mr-10 lg:-mr-20">
              <WheelPreview3D />
            </div>
          </div>
        </div>

        {/* Marquesina inferior */}
        <div className="relative z-20 w-full">
          <MarqueeBanner />
        </div>
      </section>

      {/* PREMIOS */}
      <section id="premios" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
              BENEFICIOS EXCLUSIVOS
            </p>

            <h2 className="text-4xl font-black text-[#F5E6C8] md:text-5xl">
              Premios Disponibles
            </h2>

            <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRIZES.map((prize) => (
              <div
                key={prize.clave}
                className="group relative cursor-default rounded-2xl border border-[#D4AF37]/25 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(28,24,16,0.65), rgba(18,16,9,0.75))',
                }}
              >
                {MARKETING_TAG[prize.clave] && (
                  <div className="absolute right-3 top-3">
                    <span
                      className="rounded-full px-2 py-1 text-[10px] font-bold tracking-wider"
                      style={{
                        background: 'rgba(212,175,55,0.12)',
                        color: '#D4AF37',
                        border: '1px solid rgba(212,175,55,0.25)',
                      }}
                    >
                      {MARKETING_TAG[prize.clave]}
                    </span>
                  </div>
                )}

                <prize.icon
                  size={36}
                  className="mb-4 text-[#D4AF37]"
                />

                <h3 className="mb-2 text-lg font-bold text-[#F5E6C8]">
                  {prize.prize}
                </h3>

                <p className="text-sm leading-relaxed text-[#9A7B50]">
                  {prize.detail}
                </p>

                <div className="mt-4 h-px bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
              PROCESO SIMPLE
            </p>

            <h2 className="text-4xl font-black text-[#F5E6C8] md:text-5xl">
              Cómo Funciona
            </h2>

            <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute left-[33%] right-[33%] top-12 hidden h-px bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37]/60 to-[#D4AF37]/30 md:block" />

            {steps.map((step, index) => (
              <div key={step.num} className="relative text-center">
                <div
                  className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D4AF37]/40 backdrop-blur-sm"
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(28,24,16,0.8), rgba(18,16,9,0.8))',
                  }}
                >
                  <span className="text-3xl font-black text-[#D4AF37]">
                    {step.num}
                  </span>

                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      animation: 'pulse-glow 3s ease-in-out infinite',
                      animationDelay: `${index * 0.8}s`,
                    }}
                  />
                </div>

                <h3 className="mb-3 text-xl font-bold text-[#F5E6C8]">
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed text-[#9A7B50]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LLAMADO A LA ACCIÓN */}
      <section className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, #0a0805 12%, #0a0805 100%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(212,175,55,0.3) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-black leading-tight text-[#F5E6C8] md:text-4xl">
            Tu premio puede estar
            <br />

            <span
              style={{
                background:
                  'linear-gradient(135deg, #F0C847, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              a un giro de distancia
            </span>
          </h2>

          <p className="mb-8 text-lg text-[#9A7B50]">
            No necesitas tarjeta de crédito ni registro previo. Solo gira y
            descubre.
          </p>

          <button
            type="button"
            onClick={() => navigate('roulette')}
            className="rounded-full px-10 py-4 text-base font-bold tracking-wide text-[#0a0805] transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
              letterSpacing: '0.08em',
              animation: 'pulse-glow 2.5s ease-in-out infinite',
            }}
          >
            ✦ Girar ahora ✦
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <div className="mt-auto">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}