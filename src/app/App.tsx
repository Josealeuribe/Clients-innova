import { useState } from 'react'
import LandingPage from '@/features/landing/LandingPage'
import RoulettePage from '@/features/roulette/RoulettePage'
import RegistrationPage from '@/features/registration/RegistrationPage'
import LoginPage from '@/features/login/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import bgImg from '@/shared/assets/images/image.png'
import type { Page, AppState } from '@/shared/types/navigation'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [appState, setAppState] = useState<AppState>({ prize: null, userName: null })

  const navigate = (newPage: Page) => {
    window.scrollTo(0, 0)
    setPage(newPage)
  }
  const setPrize = (prize: string) => setAppState(prev => ({ ...prev, prize }))
  const setUserName = (name: string) => setAppState(prev => ({ ...prev, userName: name }))

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0805]">
      {/* Background Image with Blur and Overlay (Only on Landing and Roulette) */}
      {(page === 'landing' || page === 'roulette') && (
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
        {page === 'roulette' && <RoulettePage navigate={navigate} onPrizeWon={setPrize} />}
        {page === 'register' && (
          <RegistrationPage navigate={navigate} prize={appState.prize} onRegister={setUserName} />
        )}
        {page === 'login' && <LoginPage navigate={navigate} />}
        {page === 'dashboard' && (
          <DashboardPage navigate={navigate} prize={appState.prize} userName={appState.userName} />
        )}
      </div>
    </div>
  )
}
