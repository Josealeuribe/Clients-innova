import { Page } from "@/shared/types/navigation"
import { useLandingContent } from "./hooks/useLandingContent"
import { useLandingNavigation } from "./hooks/useLandingNavigation"
import HeroSection from "./sections/HeroSection"
import PrizesSection from "./sections/PrizesSection"
import HowItWorksSection from "./sections/HowItWorksSection"
import CallToActionSection from "./sections/CallToActionSection"
import Footer from "@/shared/components/Footer"


interface Props {
  navigate: (page: Page) => void
}

export default function LandingPage({ navigate }: Props) {
  const { prizes, steps, getMarketingTag } = useLandingContent()
  const { irARuleta, irALogin } = useLandingNavigation(navigate)

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <HeroSection
        onRoulette={irARuleta}
        onLogin={irALogin}
      />

      <PrizesSection
        prizes={prizes}
        getMarketingTag={getMarketingTag}
      />

      <HowItWorksSection steps={steps} />

      <CallToActionSection onRoulette={irARuleta} />

      <div className="mt-auto">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
