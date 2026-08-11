import { Gift, History, IdCard, UserCog } from 'lucide-react'
import type { CajeroSection } from './cajero.types'

export const NAV_ITEMS = [
  { id: 'canjear' as CajeroSection, label: 'Canjear Código', icon: Gift },
  { id: 'buscar' as CajeroSection, label: 'Buscar por Cédula', icon: IdCard },
  { id: 'historial' as CajeroSection, label: 'Mis Canjes', icon: History },
  { id: 'cuenta' as CajeroSection, label: 'Mi Cuenta', icon: UserCog },
]
