import { ArrowLeft } from 'lucide-react'
import BackButton from '@/shared/components/BackButton'
import { useNavigation } from '@/shared/context/NavigationContext'

// "Volver" para las vistas legales (términos y privacidad). Si el usuario
// llegó desde el formulario de registro, lo devuelve ahí en vez de a Inicio:
// mandarlo a Inicio le costaría el registro que estaba llenando.
//
// En cualquier otro caso cae al BackButton normal, que por regla del negocio
// siempre regresa a Inicio. El formulario se conserva solo, sin nada
// especial aquí (ver RegistrationDraftContext).
export default function LegalBackButton() {
  const { previousPage, navigate } = useNavigation()

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
