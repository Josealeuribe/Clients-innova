import type { Page } from '@/shared/types/navigation'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'

interface Props {
  navigate: (page: Page) => void
}

const SECTIONS = [
  {
    title: '1. Responsable del Tratamiento',
    body: 'Gran Casino Cucuta, en calidad de responsable del tratamiento, recolecta y trata los datos personales de los usuarios que participan en la promoción "Gira y Gana" y demás servicios ofrecidos a través de esta plataforma.',
  },
  {
    title: '2. Datos que Recopilamos',
    body: 'Durante el registro solicitamos datos como nombres, apellidos, tipo y número de documento, fecha de nacimiento, número de celular, correo electrónico, departamento y ciudad de residencia. Esta información se utiliza únicamente para identificarte, contactarte y hacer entrega de los beneficios obtenidos.',
  },
  {
    title: '3. Finalidad del Tratamiento',
    body: 'Los datos recopilados se usan para: validar tu identidad y elegibilidad, gestionar tu registro y cuenta, entregar los premios y beneficios ganados en nuestras sedes, enviarte comunicaciones sobre tu cuenta, y —solo si lo autorizas expresamente— enviarte comunicaciones promocionales.',
  },
  {
    title: '4. Base Legal',
    body: 'El tratamiento de tus datos personales se realiza conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes sobre protección de datos personales vigentes en Colombia.',
  },
  {
    title: '5. Con Quién Compartimos tu Información',
    body: 'Tus datos no se venden ni se comparten con terceros para fines comerciales ajenos a esta promoción. Podrán compartirse únicamente con proveedores tecnológicos que apoyan la operación de la plataforma, y con autoridades competentes cuando la ley así lo exija.',
  },
  {
    title: '6. Tiempo de Conservación',
    body: 'Tus datos se conservarán durante el tiempo necesario para cumplir con las finalidades descritas y con las obligaciones legales aplicables, tras lo cual serán eliminados o anonimizados de forma segura.',
  },
  {
    title: '7. Tus Derechos (ARCO)',
    body: 'Como titular de los datos, tienes derecho a conocer, actualizar, rectificar y solicitar la supresión de tu información, así como a revocar la autorización otorgada, en cualquier momento y de forma gratuita.',
  },
  {
    title: '8. Cookies y Tecnologías Similares',
    body: 'Esta plataforma puede utilizar cookies y tecnologías similares para recordar tus preferencias y mejorar tu experiencia de navegación. Puedes gestionar estas preferencias desde la configuración de tu navegador.',
  },
  {
    title: '9. Seguridad de la Información',
    body: 'Gran Casino Cucuta implementa medidas técnicas y administrativas razonables para proteger tus datos personales frente a acceso no autorizado, pérdida o uso indebido.',
  },
  {
    title: '10. Cambios en esta Política',
    body: 'Esta Política de Privacidad podrá actualizarse en cualquier momento para reflejar cambios en nuestras prácticas o en la normativa aplicable. Te notificaremos los cambios relevantes a través de esta misma plataforma.',
  },
  {
    title: '11. Contacto',
    body: 'Para ejercer tus derechos o resolver dudas sobre el tratamiento de tus datos personales, puedes comunicarte a través de los canales de atención al cliente de Gran Casino Cucuta o acercarte a cualquiera de nuestras sedes.',
  },
]

export default function PrivacyPolicyPage({ navigate }: Props) {
  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          GRAN CASINO CUCUTA
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          Política de Privacidad
        </h1>
        <p className="text-[#6B5D3F] text-sm mb-8">
          Tratamiento de datos personales · Ley 1581 de 2012.
        </p>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <div key={section.title}
              className="rounded-2xl p-6 border border-[#D4AF37]/12"
              style={{ background: '#121009' }}>
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

      <div className="mt-auto -mx-4 sm:-mx-6 lg:-mx-8 pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
