import { ArrowLeft } from 'lucide-react'
import BackButton from '@/shared/components/BackButton'
import { useNavigation } from '@/shared/context/NavigationContext'
import { usePremioPendiente } from '@/shared/context/PremioPendienteContext'

// "Volver" para las vistas legales (términos y privacidad). Devuelve al sitio
// desde el que se entró a leer, en vez de a Inicio: mandarlo a Inicio le
// costaría al usuario aquello que estaba haciendo.
//
// Son dos casos, y en los dos el usuario estaba a un paso de comprometerse:
//
//   · Desde el REGISTRO — volver a Inicio le borraría el formulario de la
//     vista. (El contenido se conserva solo, ver RegistrationDraftContext.)
//   · Desde el MODAL DEL PREMIO — acaba de ganar y salió a comprobar las
//     condiciones antes de registrarse. Volver a Inicio lo dejaría sin forma
//     de reclamar, con el ticket venciéndose en 30 minutos.
//
// En cualquier otro caso cae al BackButton normal, que por regla del negocio
// siempre regresa a Inicio.
export default function LegalBackButton() {
  const { previousPage, navigate } = useNavigation()
  const { premioPendiente } = usePremioPendiente()

  // El premio pendiente manda sobre `previousPage`: si hay uno sin reclamar, el
  // destino útil es su modal, haya llegado el usuario desde donde haya llegado.
  // Y se comprueba que exista de verdad, no solo que venga de la ruleta —
  // también se entra a los términos desde el pie de página estando ahí, sin
  // haber ganado nada, y ahí "Volver a mi premio" sería una mentira.
  if (premioPendiente) {
    return (
      <button
        type="button"
        onClick={() => navigate('roulette')}
        aria-label="Volver a mi premio"
        className="inline-flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#F0C847] transition-colors"
      >
        <ArrowLeft size={16} className="flex-shrink-0" />
        <span>Volver a mi premio</span>
      </button>
    )
  }

  if (previousPage !== 'register') return <BackButton />

  return (
    <button
      type="button"
      onClick={() => navigate('register')}
      aria-label="Volver al registro"
      className="inline-flex items-center gap-1.5 text-sm text-[#9A7B50] hover:text-[#D4AF37] transition-colors"
    >
      <ArrowLeft size={16} className="flex-shrink-0" />
      <span>Volver al registro</span>
    </button>
  )
}
