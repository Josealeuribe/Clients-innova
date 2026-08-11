import { Sparkles } from 'lucide-react'
import BackButton from '@/shared/components/BackButton'
import { MarqueeBanner } from '../../banner/MarqueeBanner'
import DecorativeStars from '../components/DecorativeStars'
import WheelPreview3D from '../components/WheelPreview3D'
import { goldTextStyle, primaryButtonStyle } from '../utils/landingVisuals'


interface Props {
  onRoulette: () => void
  onLogin: () => void
}

export default function HeroSection({ onRoulette, onLogin }: Props) {
  return (
    <section className="relative overflow-hidden pb-0 pt-20 md:pt-24">
      <DecorativeStars />

      <div className="relative z-30 w-full">
        <MarqueeBanner />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-10 md:pt-14">
        <BackButton />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid min-h-[calc(100vh-220px)] items-center gap-6 py-8 md:grid-cols-2 md:py-6 lg:gap-10">
          <div
            className="z-10 text-center md:text-left"
            style={{ animation: 'slide-up 0.8s ease-out forwards' }}
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
                style={goldTextStyle}
              >
                Gira,
              </span>

              <span className="block text-5xl font-black text-[#F5E6C8] md:text-6xl lg:text-7xl">
                gana y
              </span>

              <span
                className="block text-5xl font-black md:text-6xl lg:text-7xl"
                style={{
                  ...goldTextStyle,
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
                onClick={onRoulette}
                className="rounded-full px-8 py-4 text-base font-bold tracking-wide text-[#0a0805] transition-all hover:scale-105 active:scale-95"
                style={primaryButtonStyle}
              >
                Gira y gana
              </button>

              <button
                type="button"
                onClick={onLogin}
                className="rounded-full border border-[#D4AF37]/40 px-8 py-4 text-base font-semibold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10"
                style={{ letterSpacing: '0.06em' }}
              >
                Ya tengo cuenta
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-[#6B5D3F] md:text-left">
              Aplican términos y condiciones. Solo para mayores de 18 años.
            </p>
          </div>

          <div className="relative flex items-center justify-center md:-mr-10 lg:-mr-20">
            <WheelPreview3D />
          </div>
        </div>
      </div>

      <div className="relative z-20 w-full">
        <MarqueeBanner />
      </div>
    </section>
  )
}
