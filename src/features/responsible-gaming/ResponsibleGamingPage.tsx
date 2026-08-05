import type { Page } from '@/shared/types/navigation'
import { ShieldAlert } from 'lucide-react'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'

interface Props {
  navigate: (page: Page) => void
}

const SECTIONS = [
  {
    title: '1. Qué es el Juego Responsable',
    body: 'El juego responsable implica participar en actividades de suerte y azar como una forma de entretenimiento, dentro de límites de tiempo y dinero definidos previamente, sin que afecte tu bienestar personal, familiar o económico.',
  },
  {
    title: '2. Restricción de Edad',
    body: 'Todas las promociones, sedes y salas de juego de Gran Casino Cucuta están dirigidas exclusivamente a personas mayores de 18 años. Nos reservamos el derecho de solicitar verificación de identidad en cualquier momento.',
  },
  {
    title: '3. Señales de Alerta',
    body: 'Presta atención si notas que juegas más tiempo o dinero del planeado, ocultas tus hábitos de juego, descuidas responsabilidades personales o laborales, o usas el juego para escapar de problemas o emociones difíciles. Estas son señales para buscar apoyo.',
    highlight: true,
  },
  {
    title: '4. Recomendaciones para Jugar de Forma Responsable',
    body: 'Define un presupuesto y un tiempo límite antes de jugar y respétalos. Evita jugar bajo efectos del alcohol o en momentos de estrés emocional. Nunca uses dinero destinado a gastos esenciales. Recuerda que el juego es entretenimiento, no una fuente de ingresos.',
  },
  {
    title: '5. Autoexclusión',
    body: 'Si sientes que necesitas alejarte temporal o permanentemente de nuestras salas de juego, puedes solicitar tu autoexclusión acercándote a cualquiera de nuestras sedes o a través de nuestros canales de atención al cliente.',
  },
  {
    title: '6. Línea de Ayuda',
    body: 'Si tú o alguien cercano necesita orientación sobre juego responsable, comunícate a la línea de ayuda 01-8000-111-444, disponible para brindar acompañamiento y remitir a los servicios de apoyo correspondientes.',
  },
]

export default function ResponsibleGamingPage({ navigate }: Props) {
  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">GRAN CASINO CUCUTA</p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-2">Juego Responsable</h1>
        <p className="text-[#6B5D3F] text-sm mb-8 flex items-center gap-1.5">
          <ShieldAlert size={16} /> Solo para mayores de 18 años · Juega con responsabilidad
        </p>

        <div className="flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className={`rounded-2xl p-6 border ${section.highlight ? 'border-[#D4AF37]/40' : 'border-[#D4AF37]/12'}`}
              style={{ background: section.highlight ? 'linear-gradient(145deg, rgba(212,175,55,0.08), #121009)' : '#121009' }}
            >
              <h3 className="font-bold text-[#F5E6C8] mb-2">{section.title}</h3>
              <p className="text-sm text-[#9A7B50] leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#D4AF37]/25 p-5 mt-8 text-center">
          <p className="text-[#D4AF37] font-bold mb-1">Línea de ayuda</p>
          <p className="text-[#F5E6C8] text-lg font-black">01-8000-111-444</p>
        </div>
      </div>

      <div className="mt-auto -mx-4 sm:-mx-6 lg:-mx-8 pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
