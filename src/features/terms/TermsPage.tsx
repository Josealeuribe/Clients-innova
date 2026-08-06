import type { Page } from '@/shared/types/navigation'
import { TriangleAlert } from 'lucide-react'
import Footer from '@/shared/components/Footer'
import LegalBackButton from '@/shared/components/LegalBackButton'

interface Props {
  navigate: (page: Page) => void
}

const SECTIONS = [
  {
    title: '1. Aceptación de los Términos',
    body: 'Al participar en la promoción "Gira y Gana" de Gran Casino Cucuta, el usuario declara haber leído, entendido y aceptado en su totalidad estos Términos y Condiciones. El desconocimiento de los mismos no exime su cumplimiento.',
  },
  {
    title: '2. Elegibilidad y Requisitos',
    body: 'Podrán participar personas naturales mayores de 18 años, residentes en Colombia, que cuenten con documento de identidad válido. Se permite un (1) registro por persona y por documento de identidad. Gran Casino Cucuta podrá solicitar la verificación de identidad en cualquier momento para validar el cumplimiento de estos requisitos.',
  },
  {
    title: '3. Mecánica de la Promoción',
    body: 'La ruleta de bienvenida otorga un (1) giro gratuito por persona, sin necesidad de registro previo. El resultado se determina de forma aleatoria al momento del giro. Para reclamar el beneficio obtenido, el usuario deberá completar el proceso de registro dentro del tiempo indicado en la pantalla de resultado; una vez vencido dicho plazo, el premio podrá quedar sin efecto.',
  },
  {
    title: '4. Premios y Beneficios',
    body: 'Los premios de la promoción son: bono de $20.000, bono de $50.000, giro adicional en la ruleta, cartón de bingo premium, entrada a evento especial y premio sorpresa. Todos los premios son bonos, cortesías o beneficios en especie, redimibles única y exclusivamente en cualquiera de nuestras 3 sedes de Gran Casino Cúcuta, presentando el documento de identidad del titular. La disponibilidad de cada premio está sujeta a las condiciones e inventario vigente en cada sede.',
    highlight: true,
  },
  {
    title: '5. Ningún Premio en Efectivo ni por Transferencia',
    body: 'Ningún premio, bono o beneficio obtenido a través de esta promoción se entrega en dinero en efectivo, ni se transfiere a cuentas bancarias, billeteras digitales o cualquier otro medio de pago. Los bonos no son transferibles a terceros ni canjeables por dinero, y su uso está limitado a los productos y servicios ofrecidos en nuestras sedes.',
    highlight: true,
  },
  {
    title: '6. Vigencia y Modificaciones',
    body: 'Gran Casino Cucuta se reserva el derecho de modificar, suspender o dar por terminada la promoción, así como de actualizar el catálogo de premios y el contenido de estos Términos y Condiciones en cualquier momento, informando oportunamente a los usuarios los cambios relevantes a través de esta plataforma.',
  },
  {
    title: '7. Protección de Datos Personales',
    body: 'Los datos personales suministrados durante el registro serán tratados conforme a la Ley 1581 de 2012 y demás normas concordantes sobre protección de datos personales en Colombia, así como a la Política de Privacidad de Gran Casino Cucuta. El usuario podrá ejercer sus derechos de acceso, corrección, actualización y supresión de sus datos en cualquier momento.',
  },
  {
    title: '8. Juego Responsable',
    body: 'Esta promoción está dirigida exclusivamente a mayores de 18 años. Gran Casino Cucuta promueve el juego responsable e invita a sus usuarios a participar de forma moderada. Ante cualquier inquietud relacionada con el juego responsable, comunícate a la línea de ayuda 01-8000-111-444.',
  },
  {
    title: '9. Restricciones y Descalificación',
    body: 'Cualquier intento de fraude, suplantación de identidad, uso de múltiples cuentas o suministro de información falsa dará lugar a la descalificación inmediata del participante y a la anulación de los premios obtenidos, sin perjuicio de las acciones legales a que haya lugar.',
  },
  {
    title: '10. Ley Aplicable y Contacto',
    body: 'Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Para consultas, quejas o reclamos relacionados con esta promoción, puedes comunicarte a través de los canales de atención al cliente de Gran Casino Cucuta o acercarte a cualquiera de nuestras sedes.',
  },
]

export default function TermsPage({ navigate }: Props) {
  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <LegalBackButton />
        </div>
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          GRAN CASINO CUCUTA
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          Términos y Condiciones
        </h1>
        <p className="text-[#6B5D3F] text-sm mb-8">
          Promoción "Gira y Gana" · Aplican a nuestras 3 sedes de Gran Casino Cúcuta.
        </p>

        {/* Disclaimer banner */}
        <div className="rounded-2xl border border-[#D4AF37]/35 p-5 mb-10 flex gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))' }}>
          <TriangleAlert size={28} className="text-[#D4AF37] flex-shrink-0" />
          <div>
            <p className="text-[#D4AF37] text-xs font-bold tracking-wider mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              AVISO IMPORTANTE
            </p>
            <p className="text-[#C4A97A] text-sm leading-relaxed">
              Ningún premio de esta promoción se entrega en{' '}
              <span className="text-[#F5E6C8] font-semibold">dinero en efectivo ni por transferencia</span>. Todos
              los bonos y beneficios son{' '}
              <span className="text-[#F5E6C8] font-semibold">redimibles únicamente en cualquiera de nuestras sedes</span>{' '}
              de Gran Casino Cúcuta.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <div key={section.title}
              className={`rounded-2xl p-6 border ${section.highlight ? 'border-[#D4AF37]/40' : 'border-[#D4AF37]/12'}`}
              style={{ background: section.highlight ? 'linear-gradient(145deg, rgba(212,175,55,0.08), #121009)' : '#121009' }}>
              <h3 className="font-bold text-[#F5E6C8] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {section.title}
              </h3>
              <p className="text-sm text-[#9A7B50] leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[#3A3020] text-xs mt-10">
          ¿Tienes dudas sobre estos términos?{' '}
          <button onClick={() => navigate('login')} className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors underline">
            Contáctanos desde tu cuenta
          </button>
        </p>
      </div>

      <div className="mt-auto -mx-4 sm:-mx-6 lg:-mx-8 pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
