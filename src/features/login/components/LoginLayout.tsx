import type { ReactNode } from 'react'
import BackButton from '@/shared/components/BackButton'
import type { LoginStep } from '../login.types'
import LoginHeader from './LoginHeader'

interface Props {
  step: LoginStep
  resetEmail: string
  vigenciaMinutos: number
  children: ReactNode
}

export default function LoginLayout({ step, resetEmail, vigenciaMinutos, children }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{
        background:
          'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(139,26,26,0.1) 0%, transparent 60%), #0a0805',
      }}
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #D4AF37 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Este glow debe ignorar eventos para no bloquear BackButton. */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)' }}
        />

        <div
          className="relative rounded-3xl border border-[#D4AF37]/20 p-8 md:p-10"
          style={{
            background: 'linear-gradient(145deg, #1C1810, #121009)',
            animation: 'slide-up 0.5s ease-out forwards',
          }}
        >
          <LoginHeader step={step} resetEmail={resetEmail} vigenciaMinutos={vigenciaMinutos} />
          {children}
        </div>

        <div className="text-center mt-6">
          <BackButton className="text-[#9A7B50] text-sm hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5 justify-center" />
        </div>
      </div>
    </div>
  )
}
