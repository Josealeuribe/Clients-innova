import { PRIZES } from '@/shared/data/prizes'

const MARKETING_TAG: Record<string, string> = {
  'bono-5000': 'FÁCIL DE GANAR',
  'bono-10000': 'MÁS COMÚN',
  'bono-20000': 'MÁS POPULAR',
  'bono-50000': 'PREMIO MAYOR',
  'carton-bingo': 'NUEVO',
  'entrada-evento': 'VIP',
  'premio-sorpresa': 'PREMIUM',
}

const STEPS = [
  {
    num: '01',
    title: 'Gira la Ruleta',
    desc: 'Presiona el botón y participa en nuestra promoción de bienvenida. Es gratis y no requiere registro previo.',
  },
  {
    num: '02',
    title: 'Descubre tu Premio',
    desc: 'La ruleta se detiene y revela el beneficio exclusivo que tenemos preparado para ti.',
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
