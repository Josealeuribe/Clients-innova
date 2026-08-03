import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/logo.png'

interface Props {
  navigate: (page: Page) => void
}

const SECTIONS = [
  {
    title: '1. Aceptación de los Términos',
    body: 'Al participar en la promoción "Gira y Gana" de Innova Club SAS, el usuario declara haber leído, entendido y aceptado en su totalidad estos Términos y Condiciones. El desconocimiento de los mismos no exime su cumplimiento.',
  },
  {
    title: '2. Elegibilidad y Requisitos',
    body: 'Podrán participar personas naturales mayores de 18 años, residentes en Colombia, que cuenten con documento de identidad válido. Se permite un (1) registro por persona y por documento de identidad. Innova Club SAS podrá solicitar la verificación de identidad en cualquier momento para validar el cumplimiento de estos requisitos.',
  },
  {
    title: '3. Mecánica de la Promoción',
    body: 'La ruleta de bienvenida otorga un (1) giro gratuito por persona, sin necesidad de registro previo. El resultado se determina de forma aleatoria al momento del giro. Para reclamar el beneficio obtenido, el usuario deberá completar el proceso de registro dentro del tiempo indicado en la pantalla de resultado; una vez vencido dicho plazo, el premio podrá quedar sin efecto.',
  },
  {
    title: '4. Premios y Beneficios',
    body: 'Los premios y beneficios que se muestran actualmente en la plataforma (créditos promocionales, bonos de bienvenida, cartones de bingo, entradas a eventos, giros adicionales, premios sorpresa, entre otros) son de carácter ILUSTRATIVO y PARCIAL, y se presentan a manera de ejemplo mientras se define el catálogo definitivo de la promoción. Los premios no son transferibles ni redimibles por dinero en efectivo, salvo que se indique expresamente lo contrario. La disponibilidad, vigencia y condiciones de cada premio serán las que se informen oficialmente al momento del lanzamiento definitivo de la promoción.',
    highlight: true,
  },
  {
    title: '5. Vigencia y Modificaciones',
    body: 'Innova Club SAS se reserva el derecho de modificar, suspender o dar por terminada la promoción, así como de actualizar el catálogo de premios y el contenido de estos Términos y Condiciones en cualquier momento, informando oportunamente a los usuarios los cambios relevantes a través de esta plataforma.',
  },
  {
    title: '6. Protección de Datos Personales',
    body: 'Los datos personales suministrados durante el registro serán tratados conforme a la Ley 1581 de 2012 y demás normas concordantes sobre protección de datos personales en Colombia, así como a la Política de Privacidad de Innova Club SAS. El usuario podrá ejercer sus derechos de acceso, corrección, actualización y supresión de sus datos en cualquier momento.',
  },
  {
    title: '7. Juego Responsable',
    body: 'Esta promoción está dirigida exclusivamente a mayores de 18 años. Innova Club SAS promueve el juego responsable e invita a sus usuarios a participar de forma moderada. Ante cualquier inquietud relacionada con el juego responsable, comunícate a la línea de ayuda 01-8000-111-444.',
  },
  {
    title: '8. Restricciones y Descalificación',
    body: 'Cualquier intento de fraude, suplantación de identidad, uso de múltiples cuentas o suministro de información falsa dará lugar a la descalificación inmediata del participante y a la anulación de los premios obtenidos, sin perjuicio de las acciones legales a que haya lugar.',
  },
  {
    title: '9. Ley Aplicable y Contacto',
    body: 'Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Para consultas, quejas o reclamos relacionados con esta promoción, puedes comunicarte a través de los canales de atención al cliente de Innova Club SAS.',
  },
]

export default function TermsPage({ navigate }: Props) {
  return (
    <div className="min-h-screen pb-16 px-4" style={{ background: '#0a0805' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 pt-4 pb-4 mb-8"
        style={{ background: 'rgba(10,8,5,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('landing')}
            className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Volver
          </button>
          <img src={logoImg} alt="Innova Club SAS" className="h-9 w-auto" />
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          INNOVA CLUB SAS
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          Términos y Condiciones
        </h1>
        <p className="text-[#6B5D3F] text-sm mb-8">
          Promoción "Gira y Gana" · Versión preliminar, pendiente de aprobación final.
        </p>

        {/* Disclaimer banner */}
        <div className="rounded-2xl border border-[#D4AF37]/35 p-5 mb-10 flex gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))' }}>
          <span className="text-3xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-[#D4AF37] text-xs font-bold tracking-wider mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              AVISO IMPORTANTE
            </p>
            <p className="text-[#C4A97A] text-sm leading-relaxed">
              Los premios que se muestran actualmente en la ruleta y en la sección de premios son de carácter{' '}
              <span className="text-[#F5E6C8] font-semibold">ilustrativo y parcial</span>, a manera de ejemplo
              mientras se define la promoción definitiva. Este documento y el catálogo de premios serán{' '}
              <span className="text-[#F5E6C8] font-semibold">actualizados con la información oficial</span>{' '}
              antes del lanzamiento real de la campaña.
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
    </div>
  )
}
