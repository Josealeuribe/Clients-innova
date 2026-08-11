
import SectionHeader from '../components/SectionHeader'
import { LandingStep } from '../services/landing.service'

interface Props {
  steps: readonly LandingStep[]
}

export default function HowItWorksSection({ steps }: Props) {
  return (
    <section id="como-funciona" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeader
          eyebrow="PROCESO SIMPLE"
          title="Cómo Funciona"
        />

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
  )
}
