import { Gift, Trophy, Banknote, type LucideIcon } from 'lucide-react'

export interface RoulettePrize {
  // Debe coincidir con el campo `clave` sembrado en server/prisma/seed.ts:
  // conecta el resultado que decide el backend con el ícono/color local.
  clave: string
  label: string
  sublabel: string
  color: string
  lightColor: string
  prize: string
  /** Valor del bono en pesos, para el boleto de la sección de premios. */
  amount: number
  icon: LucideIcon
  detail: string
  monetary: boolean
  weight: number
}

// Catálogo real de premios de la promoción "Gira y Gana". Ningún premio se entrega
// en efectivo ni por transferencia: todos son bonos de juego redimibles
// únicamente en cualquiera de nuestras 3 sedes de Gran Casino Cúcuta.
//
// Desde noviembre de 2026 la ruleta entrega solo bonos de $10.000, $20.000 y
// $50.000. El bono de $5.000, el cartón de bingo, la entrada a evento y el
// premio sorpresa se retiraron; quien tenía uno sin redimir pasó al bono de
// $10.000 (ver server/src/utils/premiosRetirados.ts).
export const PRIZES: RoulettePrize[] = [
  {
    clave: 'bono-10000',
    label: '10.000',
    sublabel: 'Bono',
    color: '#705019',
    lightColor: '#A87F28',
    prize: 'Bono de $10.000',
    amount: 10_000,
    icon: Banknote,
    detail: 'Bono redimible en cualquiera de nuestras 3 sedes al completar tu registro.',
    monetary: true,
    weight: 30,
  },
  {
    clave: 'bono-20000',
    label: '20.000',
    sublabel: 'Bono',
    color: '#8A6000',
    lightColor: '#C08800',
    prize: 'Bono de $20.000',
    amount: 20_000,
    icon: Gift,
    detail: 'Bono redimible en cualquiera de nuestras 3 sedes al completar tu registro.',
    monetary: true,
    weight: 12,
  },
  {
    clave: 'bono-50000',
    label: '50.000',
    sublabel: 'Bono',
    color: '#C9A227',
    lightColor: '#F0C847',
    prize: 'Bono de $50.000',
    amount: 50_000,
    icon: Trophy,
    detail: 'Nuestro bono de bienvenida mayor, redimible en sede al completar tu registro.',
    monetary: true,
    // Espejo de server/prisma/seed.ts, que es donde ESTE numero decide algo.
    // Aqui no lo lee nadie: el sorteo vive entero en el backend y la ruleta
    // 3D solo anima. Se mantiene al dia para que las dos listas no se
    // contradigan al leerlas. Bajado de 6 a 1 en octubre de 2026: era el bono
    // mas entregado pese a ser de los menos probables (ver el comentario
    // largo en seed.ts).
    weight: 1,
  },
]
