import {
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  ShieldUser,
  UserCog,
  Users,
} from 'lucide-react'
import type { AdminSection, CampanaAudiencia } from './admin.types'

export const NAV_ITEMS = [
  { id: 'overview' as AdminSection, label: 'Vista General', icon: LayoutDashboard },
  { id: 'clientes' as AdminSection, label: 'Clientes', icon: Users },
  { id: 'canjes' as AdminSection, label: 'Auditoría de Canjes', icon: ClipboardList },
  // Hasta cuándo se redime cada premio, y el registro de cada vez que esa fecha
  // se movió. Es una sección propia y no un dato suelto en Vista General porque
  // cada premio lleva SU fecha: pueden convivir varias a la vez.
  { id: 'vigencias' as AdminSection, label: 'Vigencias', icon: CalendarClock },
  { id: 'campanas' as AdminSection, label: 'Campañas', icon: Megaphone },
  { id: 'personal' as AdminSection, label: 'Personal', icon: ShieldUser },
  { id: 'cuenta' as AdminSection, label: 'Mi Cuenta', icon: UserCog },
]

export const AUDIENCIA_LABELS: Record<CampanaAudiencia, string> = {
  todos: 'Todos los clientes',
  bono_pendiente: 'Clientes con bono pendiente',
  sin_bono: 'Clientes sin bono',
}
