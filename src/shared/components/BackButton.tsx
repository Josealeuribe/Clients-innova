import { ArrowLeft } from 'lucide-react'
import { useNavigation } from '@/shared/context/NavigationContext'

interface Props {
  label?: string
  className?: string
  /** Oculta el texto en pantallas pequeñas y deja solo el ícono (para
   * headers angostos como el de Dashboard/Admin/Cajero) — el botón sigue
   * siendo visible y funcional en móvil, solo se acorta el texto. */
  compact?: boolean
}

// Botón de "volver" reutilizable: siempre regresa a Inicio (regla explícita
// del negocio, no un historial de navegación). No se renderiza en la propia
// vista de Inicio — es la única vista que no debe tenerlo. Siempre visible
// en móvil (nunca se oculta con "hidden") — es justamente ahí donde más
// falta hace, al no existir gesto nativo de "atrás" en la web app.
export default function BackButton({ label = 'Volver a Inicio', className, compact = false }: Props) {
  const { page, goHome, homePage } = useNavigation()

  if (page === homePage) return null

  return (
    <button
      type="button"
      onClick={goHome}
      aria-label={label}
      className={
        className ??
        'inline-flex items-center gap-1.5 text-sm text-[#9A7B50] hover:text-[#D4AF37] transition-colors'
      }
    >
      <ArrowLeft size={16} className="flex-shrink-0" />
      <span className={compact ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  )
}
