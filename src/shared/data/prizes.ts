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
  /**
   * Bloque destacado del premio, cuando hay algo que merece salir del párrafo.
   * Hoy solo lo usa el cartón de bingo, para la moto que se juega en el evento.
   */
  destacado?: { titulo: string; texto: string }
  /**
   * Datos sueltos del premio: fecha, hora, quién lo presenta, restricciones.
   *
   * POR QUÉ UNA LISTA Y NO MÁS TEXTO EN `detail`
   *
   * El cartón de bingo acumula seis hechos distintos (qué es, dónde, qué día, a
   * qué hora, quién canta, dónde se redime). Metidos en un solo párrafo había
   * que leerlo entero para encontrar la hora. En lista, cada dato se localiza
   * de un vistazo — que es como se lee la ficha de un premio.
   */
  notas?: string[]
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
    // Campaña del 5 de septiembre de 2026 (ver server/src/config/promoBingo.ts).
    // La fecha va en la etiqueta porque es una entrada a un evento con día y
    // hora, no un bono que se redime cuando se pueda: el jugador tiene que
    // verla desde la ruleta, antes de ganarlo.
    label: 'CARTÓN BINGO',
    sublabel: '5 SEP 2026',
    color: '#3D006B',
    lightColor: '#6A00B8',
    prize: 'Cartón Bingo — 5 de septiembre 2026',
    icon: Layers,
    detail: 'Cartón para participar en el Gran Bingo de Casino Ventura Plaza.',
    destacado: {
      titulo: '¡Se juega una moto 0 km!',
      texto:
        '¡Una Yamaha Crypton FINN 115 modelo 2027, 0 km, busca dueño! Participa en nuestro bingo y asegura tu oportunidad de ganarla. Cada cartón te acerca a estrenar. ¡No te quedes sin el tuyo!',
    },
    notas: [
      '5 de septiembre de 2026, 5:00 p. m. (hora de Colombia)',
      'Bingo cantado por Iván Lalinde',
      'Válido únicamente en Casino Ventura Plaza',
      'Si no puedes asistir, el bono sigue vigente y lo redimes en caja hasta su vencimiento',
    ],
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
