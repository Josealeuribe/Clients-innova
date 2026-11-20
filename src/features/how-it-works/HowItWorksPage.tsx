import type { Page } from '@/shared/types/navigation'
import type { LucideIcon } from 'lucide-react'
import { Ban, Clock, Disc3, Gift, IdCard, ListChecks, MapPin, RotateCcw, ShieldCheck, Ticket, UserPlus, Workflow } from 'lucide-react'
import fichardoSenalando from '@/shared/assets/images/fichado-señalando.png'
import BackButton from '@/shared/components/BackButton'
import InfoPageShell, { Panel } from '@/shared/components/info/InfoPageShell'
import PageHero from '@/shared/components/info/PageHero'
import PremiosResumen from '@/shared/components/info/PremiosResumen'
import AyudaJuegoPanel from '@/shared/components/info/AyudaJuegoPanel'

interface Props {
  navigate: (page: Page) => void
}

// Debe coincidir con el backend: 3 giros (GIROS_MAXIMOS), 30 minutos para
// registrarse (TICKET_TTL_MINUTES), un bono por persona y la sede asignada al
// registrarse (sortearSedeDeRedencion).
const PASOS: { num: string; icono: LucideIcon; titulo: string; texto: string; detalle: string }[] = [
  {
    num: '01',
    icono: Disc3,
    titulo: 'Gira la tragamonedas',
    texto: 'Entra a Gira y Gana y presiona "Girar" o tira de la palanca. Es gratis y no necesitas cuenta.',
    detalle: 'Tienes 5 giros. El resultado lo decide el sistema al azar en cada giro.',
  },
  {
    num: '02',
    icono: Gift,
    titulo: 'Descubre tu bono',
    texto: 'Tres cerezas: $10.000. Tres campanas: $20.000. Tres sietes: $50.000.',
    detalle: 'Si ganas, reclámalo o sigue girando: si sale uno mayor, te quedas con el mayor.',
  },
  {
    num: '03',
    icono: UserPlus,
    titulo: 'Regístrate',
    texto: 'Completa tus datos en minutos y el bono queda reservado a tu nombre.',
    detalle: 'Tienes 30 minutos desde el giro. Al registrarte se te asigna la sede donde lo redimes.',
  },
  {
    num: '04',
    icono: IdCard,
    titulo: 'Redímelo en caja',
    texto: 'Ve a tu sede con tu documento de identidad y muestra tu código.',
    detalle: 'Lo ves en "Mi cuenta", junto a la fecha límite para redimirlo.',
  },
]

const REGLAS: { icono: LucideIcon; texto: string }[] = [
  { icono: RotateCcw, texto: '5 giros por visitante' },
  { icono: Ticket, texto: 'Un único bono por persona' },
  { icono: Clock, texto: '30 minutos para registrarte' },
  { icono: MapPin, texto: 'Se redime en la sede asignada' },
  { icono: Ban, texto: 'Nada en efectivo ni por transferencia' },
  { icono: ShieldCheck, texto: 'Solo mayores de 18 años' },
]

export default function HowItWorksPage({ navigate }: Props) {
  return (
    <InfoPageShell navigate={navigate} back={<BackButton />}>
      <PageHero
        eyebrow="PROCESO SIMPLE"
        title="Cómo"
        highlight="Funciona"
        icon={Workflow}
        subtitle="De la tragamonedas a la caja en cuatro pasos. Así ganas y redimes tu bono de bienvenida en Gran Casino Cúcuta."
      />

      {/* ---------- Línea de tiempo ---------- */}
      <ol className="relative mb-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Línea dorada que une los pasos en escritorio. */}
        <div aria-hidden="true" className="absolute top-[52px] right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/60 to-[#D4AF37]/10 xl:block" />
        {PASOS.map(({ num, icono: Icono, titulo, texto, detalle }) => (
          <li key={num} className="relative">
            <Panel className="h-full transition-transform duration-300 hover:-translate-y-1.5">
              <div className="mb-5 flex items-center justify-between">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37 50%, #A0832A)' }}>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#121009]">
                    <Icono size={26} className="text-[#F0C847]" />
                  </div>
                </div>
                <span className="font-display text-5xl font-black text-[#D4AF37]/15">{num}</span>
              </div>
              <h3 className="font-display mb-2 text-2xl font-bold text-[#F5E6C8]">{titulo}</h3>
              <p className="mb-3 text-sm leading-relaxed text-[#E0CDB0]">{texto}</p>
              <p className="border-t border-dashed border-[#D4AF37]/20 pt-3 text-xs leading-relaxed text-[#9A7B50]">{detalle}</p>
            </Panel>
          </li>
        ))}
      </ol>

      {/* ---------- Premios + reglas ---------- */}
      <div className="mb-16 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Panel tono="oro">
          <p className="mb-1 text-[10px] font-extrabold tracking-[0.22em] text-[#D4AF37]">LO QUE PUEDES GANAR</p>
          <h2 className="font-display mb-4 text-2xl font-bold text-[#F5E6C8]">Tres bonos de juego</h2>
          <PremiosResumen />
          <button
            type="button"
            onClick={() => navigate('prizes')}
            className="mt-5 text-xs font-semibold text-[#F0C847] underline hover:text-[#D4AF37]"
          >
            Ver el detalle de cada premio
          </button>
        </Panel>

        <img
          src={fichardoSenalando}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="fichardo-flota mx-auto hidden w-48 select-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)] lg:block xl:w-56"
        />

        <Panel>
          <p className="mb-1 flex items-center gap-2 text-[10px] font-extrabold tracking-[0.22em] text-[#D4AF37]">
            <ListChecks size={14} /> REGLAS RÁPIDAS
          </p>
          <h2 className="font-display mb-4 text-2xl font-bold text-[#F5E6C8]">Ten en cuenta</h2>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {REGLAS.map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex items-center gap-2.5 rounded-lg border border-[#D4AF37]/15 bg-black/20 px-3 py-2.5 text-sm text-[#F5E6C8]">
                <Icono size={16} className="flex-shrink-0 text-[#D4AF37]" />
                {texto}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[#9A7B50]">
            Aplican los{' '}
            <button type="button" onClick={() => navigate('terms')} className="text-[#F0C847] underline">
              Términos y Condiciones
            </button>
            .
          </p>
        </Panel>
      </div>

      <div className="mb-16 text-center">
        <button
          type="button"
          onClick={() => navigate('roulette')}
          className="rounded-full px-12 py-4 text-base font-bold text-[#0a0805] transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)', letterSpacing: '0.08em', animation: 'pulse-glow 2.5s ease-in-out infinite' }}
        >
          ✦ Jugar ahora ✦
        </button>
      </div>

      <AyudaJuegoPanel />
    </InfoPageShell>
  )
}
