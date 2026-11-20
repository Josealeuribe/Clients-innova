import { PRIZES } from '@/shared/data/prizes'

const MARKETING_TAG: Record<string, string> = {
  'bono-10000': 'MÁS COMÚN',
  'bono-20000': 'MÁS POPULAR',
  'bono-50000': 'PREMIO MAYOR',
}

const STEPS = [
  {
    num: '01',
    title: 'Gira la Tragamonedas',
    desc: 'Presiona el botón y participa en nuestra promoción de bienvenida. Es gratis y no requiere registro previo.',
  },
  {
    num: '02',
    title: 'Descubre tu Premio',
    desc: 'Tres cerezas: $10.000. Tres campanas: $20.000. Tres sietes: $50.000. Tienes 5 giros.',
  },
  {
    num: '03',
    title: 'Regístrate y Reclámalo',
    desc: 'Completa tus datos en minutos. Tu premio queda reservado mientras lo reclamas.',
  },
] as const

export type LandingStep = (typeof STEPS)[number]
export type LandingPrize = (typeof PRIZES)[number]

export const landingService = {
  getPrizes(): readonly LandingPrize[] {
    return PRIZES
  },

  getSteps(): readonly LandingStep[] {
    return STEPS
  },

  getMarketingTag(clave: string): string | undefined {
    return MARKETING_TAG[clave]
  },
}
