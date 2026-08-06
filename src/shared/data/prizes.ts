import { Gift, Layers, Ticket, Trophy, PartyPopper, Coins, Banknote, type LucideIcon } from 'lucide-react'

export interface RoulettePrize {
  // Debe coincidir con el campo `clave` sembrado en server/prisma/seed.ts:
  // conecta el resultado que decide el backend con el ícono/color local.
  clave: string
  label: string
  sublabel: string
  color: string
  lightColor: string
  prize: string
  icon: LucideIcon
  detail: string
  monetary: boolean
  weight: number
}

// Catálogo real de premios de la promoción "Gira y Gana". Ningún premio se entrega
// en efectivo ni por transferencia: todos son bonos y cortesías redimibles
// únicamente en cualquiera de nuestras 3 sedes de Gran Casino Cúcuta.
export const PRIZES: RoulettePrize[] = [
  {
    clave: 'bono-5000',
    label: '5.000',
    sublabel: 'Bono',
    color: '#5C4A1E',
    lightColor: '#8A7030',
    prize: 'Bono de $5.000',
    icon: Coins,
    detail: 'Bono redimible en cualquiera de nuestras 3 sedes al completar tu registro.',
    monetary: true,
    weight: 25,
  },
  {
    clave: 'bono-10000',
    label: '10.000',
    sublabel: 'Bono',
    color: '#705019',
    lightColor: '#A87F28',
    prize: 'Bono de $10.000',
    icon: Banknote,
    detail: 'Bono redimible en cualquiera de nuestras 3 sedes al completar tu registro.',
    monetary: true,
    weight: 20,
  },
  {
    clave: 'bono-20000',
    label: '20.000',
    sublabel: 'Bono',
    color: '#8A6000',
    lightColor: '#C08800',
    prize: 'Bono de $20.000',
    icon: Gift,
    detail: 'Bono redimible en cualquiera de nuestras 3 sedes al completar tu registro.',
    monetary: true,
    weight: 20,
  },
  {
    clave: 'carton-bingo',
    label: 'Cartón',
    sublabel: 'Bingo',
    color: '#3D006B',
    lightColor: '#6A00B8',
    prize: 'Cartón de Bingo Premium',
    icon: Layers,
    detail: 'Para el próximo evento en vivo del club, canjeable en caja.',
    monetary: false,
    weight: 8,
  },
  {
    clave: 'entrada-evento',
    label: 'Entrada',
    sublabel: 'Evento',
    color: '#0D3B0D',
    lightColor: '#1A6E1A',
    prize: 'Entrada a Evento Especial',
    icon: Ticket,
    detail: 'Acceso a nuestro próximo evento especial en sede.',
    monetary: false,
    weight: 7,
  },
  {
    clave: 'bono-50000',
    label: '50.000',
    sublabel: 'Bono',
    color: '#C9A227',
    lightColor: '#F0C847',
    prize: 'Bono de $50.000',
    icon: Trophy,
    detail: 'Nuestro bono de bienvenida mayor, redimible en sede al completar tu registro.',
    monetary: true,
    weight: 6,
  },
  {
    clave: 'premio-sorpresa',
    label: 'Premio',
    sublabel: 'Sorpresa',
    color: '#7B1515',
    lightColor: '#B52020',
    prize: 'Premio Sorpresa',
    icon: PartyPopper,
    detail: 'Una cortesía especial de Gran Casino Cucuta, disponible en sede.',
    monetary: false,
    weight: 4,
  },
]
