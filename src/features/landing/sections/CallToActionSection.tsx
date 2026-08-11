import { primaryButtonStyle } from "../utils/landingVisuals"


interface Props {
  onRoulette: () => void
}

export default function CallToActionSection({ onRoulette }: Props) {
  return (
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
              background: 'linear-gradient(135deg, #F0C847, #D4AF37)',
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
          onClick={onRoulette}
          className="rounded-full px-10 py-4 text-base font-bold tracking-wide text-[#0a0805] transition-all hover:scale-105 active:scale-95"
          style={primaryButtonStyle}
        >
          ✦ Girar ahora ✦
        </button>
      </div>
    </section>
  )
}
