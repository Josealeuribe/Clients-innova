import { useMemo } from 'react'
import { landingService } from '../services/landing.service'


export function useLandingContent() {
  return useMemo(
    () => ({
      prizes: landingService.getPrizes(),
      steps: landingService.getSteps(),
      getMarketingTag: landingService.getMarketingTag,
    }),
    [],
  )
}
