import type { Page } from '@/shared/types/navigation'
import { Building2, Clock, Cookie, Database, FileClock, Mail, Scale, Share2, ShieldCheck, Target, UserCog, Lock } from 'lucide-react'
import LegalBackButton from '@/shared/components/LegalBackButton'
import InfoPageShell from '@/shared/components/info/InfoPageShell'
import PageHero from '@/shared/components/info/PageHero'
import LegalDocument, { type SeccionLegal } from '@/shared/components/info/LegalDocument'

interface Props {
  navigate: (page: Page) => void
}

const fuerte = 'font-semibold text-[#F5E6C8]'

const SECCIONES: SeccionLegal[] = [
  {
    id: 'responsable',
    title: 'Responsable del tratamiento',
    icon: Building2,
    body: (
      <p>
        Gran Casino Cúcuta, como responsable del tratamiento, recolecta y trata los datos personales de quienes
        participan en la promoción "Gira y Gana" y en los demás servicios de esta plataforma.
      </p>
    ),
  },
  {
    id: 'datos',
    title: 'Datos que recopilamos',
    icon: Database,
    body: (
      <>
        <p>Durante el registro pedimos:</p>
        <div className="flex flex-wrap gap-2">
          {['Nombres y apellidos', 'Tipo y número de documento', 'Fecha de nacimiento', 'Celular', 'Correo electrónico', 'Departamento y ciudad'].map((d) => (
            <span key={d} className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] px-3 py-1 text-xs text-[#E8DCC4]">
              {d}
            </span>
          ))}
        </div>
        <p>Solo se usan para identificarte, contactarte y entregarte los beneficios que ganes.</p>
      </>
    ),
  },
  {
    id: 'finalidad',
    title: 'Finalidad del tratamiento',
    icon: Target,
    body: (
      <p>
        Validar tu identidad y tu edad, gestionar tu cuenta, entregarte en sede los bonos ganados, avisarte sobre tu
        cuenta y, <span className={fuerte}>solo si lo autorizas expresamente</span>, enviarte comunicaciones
        promocionales.
      </p>
    ),
  },
  {
    id: 'base-legal',
    title: 'Base legal',
    icon: Scale,
    body: <p>Ley 1581 de 2012, Decreto 1377 de 2013 y demás normas colombianas de protección de datos personales.</p>,
  },
  {
    id: 'compartir',
    title: 'Con quién compartimos tu información',
    icon: Share2,
    highlight: true,
    body: (
      <p>
        <span className={fuerte}>Tus datos no se venden.</span> Solo se comparten con los proveedores tecnológicos que
        operan la plataforma y con autoridades competentes cuando la ley lo exige.
      </p>
    ),
  },
  {
    id: 'conservacion',
    title: 'Tiempo de conservación',
    icon: Clock,
    body: (
      <p>
        Conservamos tus datos el tiempo necesario para cumplir estas finalidades y las obligaciones legales; después se
        eliminan o se anonimizan de forma segura.
      </p>
    ),
  },
  {
    id: 'derechos',
    title: 'Tus derechos',
    icon: UserCog,
    highlight: true,
    body: (
      <>
        <div className="grid gap-2 sm:grid-cols-2">
          {['Conocer tus datos', 'Actualizarlos y rectificarlos', 'Pedir su supresión', 'Revocar la autorización'].map((d) => (
            <span key={d} className="rounded-lg border border-[#D4AF37]/20 bg-black/20 px-3 py-2 text-sm text-[#F5E6C8]">
              {d}
            </span>
          ))}
        </div>
        <p>En cualquier momento y de forma gratuita.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies y tecnologías similares',
    icon: Cookie,
    body: (
      <p>
        Usamos cookies para mantener tu sesión y llevar la cuenta de los giros de la ruleta. Puedes gestionarlas desde
        la configuración de tu navegador.
      </p>
    ),
  },
  {
    id: 'seguridad',
    title: 'Seguridad de la información',
    icon: ShieldCheck,
    body: (
      <p>
        Aplicamos medidas técnicas y administrativas razonables para proteger tus datos: las contraseñas se guardan
        cifradas y el acceso a la información está restringido al personal autorizado.
      </p>
    ),
  },
  {
    id: 'cambios',
    title: 'Cambios en esta política',
    icon: FileClock,
    body: <p>Esta política puede actualizarse; los cambios relevantes se publicarán en esta misma plataforma.</p>,
  },
  {
    id: 'contacto',
    title: 'Contacto',
    icon: Mail,
    body: (
      <p>
        Para ejercer tus derechos o resolver dudas, usa los canales de atención de Gran Casino Cúcuta o acércate a
        cualquiera de nuestras sedes.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage({ navigate }: Props) {
  return (
    <InfoPageShell navigate={navigate} back={<LegalBackButton />} ancho="lectura">
      <PageHero
        eyebrow="TRATAMIENTO DE DATOS"
        title="Política de"
        highlight="Privacidad"
        icon={Lock}
        subtitle="Cómo cuidamos tus datos personales · Ley 1581 de 2012."
      />
      <LegalDocument secciones={SECCIONES} />
      <div className="mt-12 flex justify-center">
        <LegalBackButton />
      </div>
    </InfoPageShell>
  )
}
