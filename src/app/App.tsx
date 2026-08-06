import { useState } from 'react'
import LandingPage from '@/features/landing/LandingPage'
import RoulettePage from '@/features/roulette/RoulettePage'
import RegistrationPage from '@/features/registration/RegistrationPage'
import LoginPage from '@/features/login/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import TermsPage from '@/features/terms/TermsPage'
import PrivacyPolicyPage from '@/features/privacy/PrivacyPolicyPage'
import HomePage from '@/features/home/HomePage'
import PrizesPage from '@/features/prizes/PrizesPage'
import HowItWorksPage from '@/features/how-it-works/HowItWorksPage'
import FaqPage from '@/features/faq/FaqPage'
import ResponsibleGamingPage from '@/features/responsible-gaming/ResponsibleGamingPage'
import AdminPage from '@/features/admin/AdminPage'
import CajeroPage from '@/features/cajero/CajeroPage'
import Navbar from '@/shared/components/Navbar'
import { NavigationProvider, useNavigation } from '@/shared/context/NavigationContext'
import { RegistrationDraftProvider } from '@/shared/context/RegistrationDraftContext'
import bgImg from '@/shared/assets/images/image-copy.png'

import type { Page, AppState } from '@/shared/types/navigation'

const PAGES_WITH_NAVBAR: Page[] = [
  'landing',
  'home',
  'prizes',
  'how-it-works',
  'faq',
  'responsible-gaming',
  'terms',
  'privacy',
  'roulette',
]

function AppShell() {
  const { page, navigate } = useNavigation()
  const [appState, setAppState] = useState<AppState>({ prize: null, ticket: null })

  const setPrizeWon = (prize: string, ticket: string) => setAppState({ prize, ticket })

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0805]">
      {PAGES_WITH_NAVBAR.includes(page) && <Navbar navigate={navigate} />}

      {/* Background Image with Blur and Overlay (all pages that share the navbar/footer chrome) */}
      {PAGES_WITH_NAVBAR.includes(page) && (
        <>
          <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: `url(${bgImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              filter: 'blur(6px)',
              transform: 'scale(1.05)', // Prevent blurred edges from showing background color
            }}
          />
          <div className="fixed inset-0 z-0 pointer-events-none bg-black/75" />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {page === 'landing' && <LandingPage navigate={navigate} />}
        {page === 'roulette' && <RoulettePage navigate={navigate} onPrizeWon={setPrizeWon} />}
        {page === 'register' && (
          <RegistrationPage navigate={navigate} prize={appState.prize} ticket={appState.ticket} />
        )}
        {page === 'login' && <LoginPage navigate={navigate} />}
        {page === 'dashboard' && <DashboardPage navigate={navigate} />}
        {page === 'terms' && <TermsPage navigate={navigate} />}
        {page === 'privacy' && <PrivacyPolicyPage navigate={navigate} />}
        {page === 'home' && <HomePage navigate={navigate} />}
        {page === 'prizes' && <PrizesPage navigate={navigate} />}
        {page === 'how-it-works' && <HowItWorksPage navigate={navigate} />}
        {page === 'faq' && <FaqPage navigate={navigate} />}
        {page === 'responsible-gaming' && <ResponsibleGamingPage navigate={navigate} />}
        {page === 'admin' && <AdminPage navigate={navigate} />}
        {page === 'cajero' && <CajeroPage navigate={navigate} />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    // El borrador del registro va POR ENCIMA de AppShell: es justamente el
    // cambio de vista lo que desmonta RegistrationPage, así que el provider
    // tiene que sobrevivirlo para conservar el formulario.
    <NavigationProvider fallbackPage="landing">
      <RegistrationDraftProvider>
        <AppShell />
      </RegistrationDraftProvider>
    </NavigationProvider>
  )
}
