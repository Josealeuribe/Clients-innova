
import MarketingTag from '../components/MarketingTag'
import SectionHeader from '../components/SectionHeader'
import { LandingPrize } from '../services/landing.service'

interface Props {
  prizes: readonly LandingPrize[]
  getMarketingTag: (clave: string) => string | undefined
}

export default function PrizesSection({ prizes, getMarketingTag }: Props) {
  return (
    <section id="premios" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="BENEFICIOS EXCLUSIVOS"
          title="Premios Disponibles"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {prizes.map((prize) => (
            <div
              key={prize.clave}
              className="group relative cursor-default rounded-2xl border border-[#D4AF37]/25 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60"
              style={{
                background:
                  'linear-gradient(145deg, rgba(28,24,16,0.65), rgba(18,16,9,0.75))',
              }}
            >
              <MarketingTag label={getMarketingTag(prize.clave)} />

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
  )
}
