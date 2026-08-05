import type { Page } from '@/shared/types/navigation'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'

interface Props {
  navigate: (page: Page) => void
}

const STEPS = [
  {
    num: '01',
    title: 'Gira la Ruleta',
    desc: 'Presiona el botón y participa en nuestra promoción de bienvenida. Es gratis y no requiere registro previo.',
    detail: 'Cualquier persona mayor de 18 años puede girar una vez por promoción. El giro visual de la ruleta es completamente aleatorio.',
  },
  {
    num: '02',
    title: 'Descubre tu Premio',
    desc: 'La ruleta se detiene y revela el beneficio exclusivo que tenemos preparado para ti.',
    detail: 'La mayoría de los giros premian un bono de $20.000 redimible en cualquiera de nuestras sedes. Ocasionalmente puedes ganar nuestro bono mayor de $50.000, y también hay premios adicionales como giros extra, cartones de bingo, entradas a eventos o sorpresas del club. Ningún premio se entrega en efectivo ni por transferencia.',
  },
  {
    num: '03',
    title: 'Regístrate y Reclámalo',
    desc: 'Completa tus datos en minutos. Tu premio queda reservado mientras lo reclamas.',
    detail: 'Si ganaste un bono ($20.000 o $50.000), tienes 30 minutos para completar tu registro y dejarlo reservado a tu nombre; luego lo redimes presentando tu documento en cualquiera de nuestras sedes. Los premios de cortesía no requieren registro para "reclamarse": son un beneficio adicional del club que se entrega directamente en sede.',
  },
]

export default function HowItWorksPage({ navigate }: Props) {
  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">PROCESO SIMPLE</p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-8">Cómo Funciona</h1>

        <div className="flex flex-col gap-5 mb-10">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl p-6 border border-[#D4AF37]/15"
              style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-2xl font-black text-[#D4AF37]">{step.num}</span>
                <h3 className="text-lg font-bold text-[#F5E6C8]">{step.title}</h3>
              </div>
              <p className="text-sm text-[#C4A97A] leading-relaxed mb-2">{step.desc}</p>
              <p className="text-sm text-[#9A7B50] leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#D4AF37]/20 p-5 mb-10 bg-[#D4AF37]/5">
          <p className="text-[#D4AF37] text-xs font-bold tracking-wider mb-2">REGLAS RÁPIDAS</p>
          <ul className="text-sm text-[#9A7B50] leading-relaxed list-disc pl-5 space-y-1">
            <li>Un giro por promoción y por persona.</li>
            <li>Solo mayores de 18 años pueden participar.</li>
            <li>Los bonos de mayor valor se reservan por 30 minutos tras el giro.</li>
            <li>Ningún premio se entrega en efectivo ni por transferencia: todos son bonos y cortesías redimibles únicamente en sede.</li>
            <li>Aplican nuestros Términos y Condiciones y la Política de Juego Responsable.</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('roulette')}
            className="px-10 py-4 rounded-full text-[#0a0805] font-bold text-base tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)', letterSpacing: '0.08em' }}
          >
            Girar la Ruleta
          </button>
        </div>
      </div>

      <div className="mt-auto -mx-4 sm:-mx-6 lg:-mx-8 pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
