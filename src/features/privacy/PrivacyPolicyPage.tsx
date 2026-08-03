import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/logo.png'

interface Props {
  navigate: (page: Page) => void
}

const SECTIONS = [
  {
    title: '1. Responsable del Tratamiento',
    body: 'Innova Club SAS, en calidad de responsable del tratamiento, recolecta y trata los datos personales de los usuarios que participan en la promoción "Gira y Gana" y demás servicios ofrecidos a través de esta plataforma.',
  },
  {
    title: '2. Datos que Recopilamos',
    body: 'Durante el registro solicitamos datos como nombres, apellidos, tipo y número de documento, fecha de nacimiento, número de celular, correo electrónico, departamento y ciudad de residencia. Esta información se utiliza únicamente para identificarte, contactarte y hacer entrega de los beneficios obtenidos.',
  },
  {
    title: '3. Finalidad del Tratamiento',
    body: 'Los datos recopilados se usan para: validar tu identidad y elegibilidad, gestionar tu registro y cuenta, entregar los premios y beneficios ganados, enviarte comunicaciones sobre tu cuenta, y —solo si lo autorizas expresamente— enviarte comunicaciones promocionales.',
  },
  {
    title: '4. Información de Ejemplo — Sitio en Pruebas',
    body: 'Esta plataforma se encuentra actualmente en fase de pruebas. Los textos, plazos, correos de contacto y demás datos de esta Política de Privacidad son de carácter ILUSTRATIVO y PARCIAL, y serán reemplazados por la información real y definitiva de Innova Club SAS antes del lanzamiento oficial.',
    highlight: true,
  },
  {
    title: '5. Base Legal',
    body: 'El tratamiento de tus datos personales se realiza conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes sobre protección de datos personales vigentes en Colombia.',
  },
  {
    title: '6. Con Quién Compartimos tu Información',
    body: 'Tus datos no se venden ni se comparten con terceros para fines comerciales ajenos a esta promoción. Podrán compartirse únicamente con proveedores tecnológicos que apoyan la operación de la plataforma, y con autoridades competentes cuando la ley así lo exija.',
  },
  {
    title: '7. Tiempo de Conservación',
    body: 'Tus datos se conservarán durante el tiempo necesario para cumplir con las finalidades descritas y con las obligaciones legales aplicables, tras lo cual serán eliminados o anonimizados de forma segura.',
  },
  {
    title: '8. Tus Derechos (ARCO)',
    body: 'Como titular de los datos, tienes derecho a conocer, actualizar, rectificar y solicitar la supresión de tu información, así como a revocar la autorización otorgada, en cualquier momento y de forma gratuita.',
  },
  {
    title: '9. Cookies y Tecnologías Similares',
    body: 'Esta plataforma puede utilizar cookies y tecnologías similares para recordar tus preferencias y mejorar tu experiencia de navegación. Puedes gestionar estas preferencias desde la configuración de tu navegador.',
  },
  {
    title: '10. Seguridad de la Información',
    body: 'Innova Club SAS implementa medidas técnicas y administrativas razonables para proteger tus datos personales frente a acceso no autorizado, pérdida o uso indebido.',
  },
  {
    title: '11. Cambios en esta Política',
    body: 'Esta Política de Privacidad podrá actualizarse en cualquier momento para reflejar cambios en nuestras prácticas o en la normativa aplicable. Te notificaremos los cambios relevantes a través de esta misma plataforma.',
  },
  {
    title: '12. Contacto',
    body: 'Para ejercer tus derechos o resolver dudas sobre el tratamiento de tus datos personales, puedes comunicarte a través de los canales de atención al cliente de Innova Club SAS.',
  },
]

export default function PrivacyPolicyPage({ navigate }: Props) {
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
          Política de Privacidad
        </h1>
        <p className="text-[#6B5D3F] text-sm mb-8">
          Tratamiento de datos personales · Versión preliminar, pendiente de aprobación final.
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
              Esta plataforma se encuentra en fase de{' '}
              <span className="text-[#F5E6C8] font-semibold">pruebas</span>. El contenido de esta Política de
              Privacidad es{' '}
              <span className="text-[#F5E6C8] font-semibold">ilustrativo y parcial</span>, a manera de ejemplo,
              y será{' '}
              <span className="text-[#F5E6C8] font-semibold">reemplazado por la información oficial y real</span>{' '}
              antes del lanzamiento definitivo.
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
          ¿Tienes dudas sobre el tratamiento de tus datos?{' '}
          <button onClick={() => navigate('login')} className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors underline">
            Contáctanos desde tu cuenta
          </button>
        </p>
      </div>
    </div>
  )
}
