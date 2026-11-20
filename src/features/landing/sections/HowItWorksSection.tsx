import type { LucideIcon } from 'lucide-react'
import { ChevronRight, Disc3, Gift, IdCard, ShieldCheck, Ticket, UserPlus } from 'lucide-react'
import fichardoSenalando from '@/shared/assets/images/fichado-señalando.png'
import SectionHeader from '../components/SectionHeader'
import { LandingStep } from '../services/landing.service'

interface Props {
  steps: readonly LandingStep[]
}

// Lo visual de cada paso vive aqui y no en landing.service: el servicio dice
// QUE pasa en cada paso, esto decide como se ve. Va por posicion porque los
// pasos son una secuencia fija (girar -> descubrir -> registrarse).
const ESTILO_PASO: { icono: LucideIcon; chip: string }[] = [
  { icono: Disc3, chip: 'Gratis · sin registro previo' },
  { icono: Gift, chip: 'Resultado al instante' },
  { icono: UserPlus, chip: 'Listo en minutos' },
]

const REQUISITOS: { icono: LucideIcon; texto: string }[] = [
  { icono: ShieldCheck, texto: 'Solo mayores de 18 años' },
  { icono: IdCard, texto: 'Redime en caja con tu cédula' },
  { icono: Ticket, texto: 'Un bono por persona' },
]

export default function HowItWorksSection({ steps }: Props) {
  return (
    <section id="como-funciona" className="relative overflow-hidden py-24">
      {/* Resplandor de fondo: rojo casino a un lado, oro al otro, muy tenues. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 55% at 12% 40%, rgba(139,26,26,0.16), transparent 70%), radial-gradient(40% 50% at 88% 60%, rgba(212,175,55,0.10), transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <SectionHeader eyebrow="PROCESO SIMPLE" title="Cómo Funciona" />

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-4">
          {/* ---------- Pasos ---------- */}
          <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => {
              const { icono: Icono, chip } = ESTILO_PASO[index] ?? ESTILO_PASO[0]
              const ultimo = index === steps.length - 1

              return (
                <li key={step.num} className="relative">
                  <article
                    className="group relative h-full overflow-hidden rounded-2xl border border-[#D4AF37]/25 p-2 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60"
                    style={{
                      backgroundColor: '#15120B',
                      backgroundImage:
                        'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 7px), radial-gradient(110% 80% at 0% 0%, rgba(212,175,55,0.10), transparent 60%)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
                    }}
                  >
                    <div className="relative h-full rounded-xl border border-dashed border-[#D4AF37]/20 px-6 pt-6 pb-7">
                      {/* Número gigante de marca de agua. */}
                      <span
                        aria-hidden="true"
                        className="font-display pointer-events-none absolute -top-4 right-3 text-[7.5rem] leading-none font-black text-[#D4AF37]/[0.06] select-none"
                      >
                        {step.num}
                      </span>

                      <div className="mb-6 flex items-center gap-4">
                        {/* Ícono en ficha dorada, con un halo que pulsa
                            desfasado en cada paso. */}
                        <div className="relative flex-shrink-0">
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full"
                            style={{ animation: 'pulse-glow 3s ease-in-out infinite', animationDelay: `${index * 0.8}s` }}
                          />
                          <div
                            className="relative flex h-16 w-16 items-center justify-center rounded-full p-[3px] transition-transform duration-500 group-hover:rotate-[360deg]"
                            style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37 50%, #A0832A)' }}
                          >
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#121009]">
                              <Icono size={28} className="text-[#F0C847]" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold tracking-[0.28em] text-[#D4AF37]">
                            <span className="text-[#B52020]">♦</span> PASO {step.num}
                          </p>
                          <h3 className="font-display text-2xl leading-tight font-bold text-[#F5E6C8]">
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <p className="mb-6 text-sm leading-relaxed text-[#C4A97A]">{step.desc}</p>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/8 px-3 py-1 text-[11px] font-semibold text-[#F0C847]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F0C847]" />
                        {chip}
                      </span>
                    </div>
                  </article>

                  {/* Conector hacia el siguiente paso: flecha dorada a la
                      derecha en escritorio, hacia abajo en celular. */}
                  {!ultimo && (
                    <div
                      aria-hidden="true"
                      className="absolute z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#121009] text-[#F0C847] shadow-[0_0_18px_rgba(212,175,55,0.35)] max-md:-bottom-[1.6rem] max-md:left-1/2 max-md:-translate-x-1/2 max-md:rotate-90 md:top-1/2 md:-right-[1.65rem] md:-translate-y-1/2"
                    >
                      <ChevronRight size={18} />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>

          {/* ---------- Fichardo señalando los pasos ---------- */}
          <div className="order-first flex justify-center lg:order-none">
            <img
              src={fichardoSenalando}
              alt="Fichardo señalando los pasos"
              decoding="async"
              className="fichardo-flota w-40 select-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)] sm:w-48 lg:w-60 xl:w-72"
            />
          </div>
        </div>

        {/* ---------- Requisitos ---------- */}
        <div className="mt-12 flex flex-col items-stretch justify-center gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04] px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10">
          {REQUISITOS.map(({ icono: Icono, texto }) => (
            <p key={texto} className="flex items-center gap-2.5 text-sm text-[#C4A97A]">
              <Icono size={18} className="flex-shrink-0 text-[#D4AF37]" />
              {texto}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
