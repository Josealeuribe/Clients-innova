import type { Page } from '@/shared/types/navigation'
import {
  Ban,
  CalendarClock,
  CircleCheck,
  Disc3,
  FileText,
  Gavel,
  HeartHandshake,
  Lock,
  ScrollText,
  ShieldAlert,
  Ticket,
  TriangleAlert,
  UserCheck,
} from 'lucide-react'
import LegalBackButton from '@/shared/components/LegalBackButton'
import InfoPageShell from '@/shared/components/info/InfoPageShell'
import PageHero from '@/shared/components/info/PageHero'
import LegalDocument, { type SeccionLegal } from '@/shared/components/info/LegalDocument'
import PremiosResumen from '@/shared/components/info/PremiosResumen'
import { LINEA_PRINCIPAL } from '@/shared/data/ayuda'

interface Props {
  navigate: (page: Page) => void
}

const fuerte = 'font-semibold text-[#F5E6C8]'

// La mecánica aquí escrita tiene que coincidir con el backend:
// GIROS_MAXIMOS = 3 (server/src/routes/ruleta.routes.ts), un bono por cliente
// (BonoGanado.clienteId @unique), ticket de 30 minutos (TICKET_TTL_MINUTES) y
// catálogo de 3 bonos (server/prisma/seed.ts).
function secciones(navigate: (page: Page) => void): SeccionLegal[] {
  return [
    {
      id: 'aceptacion',
      title: 'Aceptación de los términos',
      icon: FileText,
      body: (
        <p>
          Al participar en la promoción <span className={fuerte}>"Gira y Gana"</span> de Gran Casino Cúcuta, el usuario
          declara haber leído, entendido y aceptado en su totalidad estos Términos y Condiciones. El desconocimiento de
          los mismos no exime su cumplimiento.
        </p>
      ),
    },
    {
      id: 'elegibilidad',
      title: 'Elegibilidad y requisitos',
      icon: UserCheck,
      body: (
        <ul className="space-y-2">
          {[
            'Personas naturales mayores de 18 años, residentes en Colombia.',
            'Documento de identidad válido, que se presenta en caja para redimir.',
            'Un (1) registro por persona y por documento de identidad.',
            'Gran Casino Cúcuta puede verificar la identidad en cualquier momento.',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <CircleCheck size={16} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
              {t}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'mecanica',
      title: 'Mecánica de la promoción',
      icon: Disc3,
      body: (
        <>
          <p>
            Cada visitante tiene <span className={fuerte}>5 giros</span> de la tragamonedas de bienvenida, sin
            registro previo. El resultado lo decide el sistema de forma aleatoria en el momento del giro. Hay premio
            cuando caen tres símbolos iguales en la línea de pago: <span className={fuerte}>tres cerezas</span>, bono
            de $10.000; <span className={fuerte}>tres campanas</span>, bono de $20.000;{' '}
            <span className={fuerte}>tres sietes</span>, bono de $50.000. Cualquier otra combinación no tiene premio.
            Si se gana más de una vez, se conserva el bono de mayor valor.
          </p>
          <p>
            Para reclamar el premio obtenido se debe completar el registro dentro de los{' '}
            <span className={fuerte}>30 minutos</span> siguientes al giro. Vencido ese plazo el premio queda sin
            efecto. La promoción entrega <span className={fuerte}>un único bono por persona</span>: una vez reclamado,
            no se puede volver a girar.
          </p>
        </>
      ),
    },
    {
      id: 'premios',
      title: 'Premios',
      icon: Ticket,
      highlight: true,
      body: (
        <>
          <p>
            Los premios de la promoción son únicamente <span className={fuerte}>tres bonos de juego</span>:
          </p>
          <div className="py-2">
            <PremiosResumen />
          </div>
          <p>
            Se redimen en la caja de cualquiera de nuestras 3 sedes de Gran Casino Cúcuta presentando el documento de
            identidad del titular. Los bonos pendientes de premios anteriores que fueron retirados del catálogo (bono de
            $5.000, cartón de bingo, entrada a evento y premio sorpresa) se convierten en un{' '}
            <span className={fuerte}>bono de $10.000</span>.
          </p>
        </>
      ),
    },
    {
      id: 'sin-efectivo',
      title: 'Ningún premio en efectivo ni por transferencia',
      icon: Ban,
      highlight: true,
      body: (
        <p>
          Ningún bono se entrega en dinero en efectivo ni se transfiere a cuentas bancarias, billeteras digitales u
          otro medio de pago. Los bonos no son transferibles a terceros ni canjeables por dinero, y solo se usan en los
          juegos y servicios de nuestras sedes.
        </p>
      ),
    },
    {
      id: 'vigencia',
      title: 'Vigencia y modificaciones',
      icon: CalendarClock,
      body: (
        <>
          <p>
            Cada bono se puede redimir hasta la fecha de vigencia que se informa al ganarlo, en la ruleta y en tu
            cuenta. Si la promoción se extiende, los bonos pendientes pueden extenderse con ella; si se acorta, los bonos
            ya entregados conservan su fecha.
          </p>
          <p>
            Gran Casino Cúcuta puede modificar, suspender o terminar la promoción y actualizar el catálogo de premios o
            estos términos, informando los cambios relevantes en esta plataforma.
          </p>
        </>
      ),
    },
    {
      id: 'datos',
      title: 'Protección de datos personales',
      icon: Lock,
      body: (
        <p>
          Los datos del registro se tratan conforme a la Ley 1581 de 2012 y a nuestra{' '}
          <button type="button" onClick={() => navigate('privacy')} className="text-[#F0C847] underline hover:text-[#D4AF37]">
            Política de Privacidad
          </button>
          . Puedes conocer, actualizar, rectificar y pedir la supresión de tus datos en cualquier momento.
        </p>
      ),
    },
    {
      id: 'juego-responsable',
      title: 'Juego responsable',
      icon: HeartHandshake,
      body: (
        <p>
          Esta promoción es exclusiva para mayores de 18 años. El juego es entretenimiento, no una forma de ganar
          dinero. Si sientes que dejó de serlo, llama a la línea{' '}
          <a href={`tel:${LINEA_PRINCIPAL.tel}`} className="font-semibold text-[#F0C847] underline">
            {LINEA_PRINCIPAL.numero}
          </a>{' '}
          o consulta nuestra sección de{' '}
          <button
            type="button"
            onClick={() => navigate('responsible-gaming')}
            className="text-[#F0C847] underline hover:text-[#D4AF37]"
          >
            Juego Responsable
          </button>
          .
        </p>
      ),
    },
    {
      id: 'descalificacion',
      title: 'Restricciones y descalificación',
      icon: ShieldAlert,
      body: (
        <p>
          Cualquier intento de fraude, suplantación de identidad, uso de múltiples cuentas o información falsa dará
          lugar a la descalificación inmediata y a la anulación de los premios, sin perjuicio de las acciones legales a
          que haya lugar.
        </p>
      ),
    },
    {
      id: 'ley',
      title: 'Ley aplicable y contacto',
      icon: Gavel,
      body: (
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Para consultas, quejas o reclamos puedes
          usar los canales de atención de Gran Casino Cúcuta o acercarte a cualquiera de nuestras sedes.
        </p>
      ),
    },
  ]
}

export default function TermsPage({ navigate }: Props) {
  return (
    <InfoPageShell navigate={navigate} back={<LegalBackButton />} ancho="lectura">
      <PageHero
        eyebrow="GRAN CASINO CÚCUTA"
        title="Términos y"
        highlight="Condiciones"
        icon={ScrollText}
        subtitle='Promoción "Gira y Gana" · Aplican en nuestras 3 sedes de Gran Casino Cúcuta.'
      />

      {/* Lo que nadie debe pasar por alto, antes del texto largo. */}
      <div className="mb-10 flex gap-4 rounded-2xl border border-[#D4AF37]/40 p-5" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(212,175,55,0.03))' }}>
        <TriangleAlert size={28} className="flex-shrink-0 text-[#F0C847]" />
        <div>
          <p className="mb-1 text-xs font-bold tracking-wider text-[#D4AF37]">EN RESUMEN</p>
          <p className="text-sm leading-relaxed text-[#E0CDB0]">
            Ganas uno de <span className={fuerte}>tres bonos de juego ($10.000, $20.000 o $50.000)</span>, uno por
            persona, y lo redimes en caja con tu cédula. Ningún premio se entrega en{' '}
            <span className={fuerte}>efectivo ni por transferencia</span>. Solo mayores de 18 años.
          </p>
        </div>
      </div>

      <LegalDocument secciones={secciones(navigate)} />

      {/* El "volver" repetido al pie: quien entra desde el modal del premio
          termina de leer aquí abajo y no debe tener que subir para reclamar. */}
      <div className="mt-12 flex justify-center">
        <LegalBackButton />
      </div>
    </InfoPageShell>
  )
}
