import { CalendarClock, Gift, History, IdCard, UserCog } from 'lucide-react'
import type { CajeroSection } from './cajero.types'

export const NAV_ITEMS = [
  { id: 'canjear' as CajeroSection, label: 'Canjear Código', icon: Gift },
  { id: 'buscar' as CajeroSection, label: 'Buscar por Cédula', icon: IdCard },
  { id: 'historial' as CajeroSection, label: 'Mis Canjes', icon: History },
  // La cajera es quien recibe en el mostrador el "¿hasta cuándo puedo
  // redimirlo?" y el "a mí me dijeron otra fecha". Antes tenía que preguntarle
  // al administrador; ahora la fecha vigente y el registro de cambios están en
  // su propio panel.
  { id: 'vigencias' as CajeroSection, label: 'Vigencias', icon: CalendarClock },
  { id: 'cuenta' as CajeroSection, label: 'Mi Cuenta', icon: UserCog },
]
