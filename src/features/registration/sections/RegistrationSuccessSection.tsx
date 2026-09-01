import { Trophy } from 'lucide-react'
import type { Page } from '@/shared/types/navigation'

interface Props {
  navigate: (page: Page) => void
  prize: string | null
}

export default function RegistrationSuccessSection({
  navigate,
  prize,
}: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), #0a0805',
      }}
    >
      <div
        className="max-w-md w-full text-center"
        style={{ animation: 'modal-in 0.5s ease-out forwards' }}
      >
        <Trophy
          size={80}
          className="text-[#D4AF37] mx-auto mb-6"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))',
          }}
        />

        <p
          className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          REGISTRO EXITOSO
        </p>

        <h1
          className="text-3xl font-black text-[#F5E6C8] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          ¡Tu cuenta fue creada correctamente!
        </h1>

        <p className="text-[#9A7B50] mb-6">
          Tu premio ya se encuentra disponible en tu perfil. Bienvenido a Gran Casino Cucuta.
        </p>

        {prize && (
          <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/8 p-4 mb-6 text-sm">
            <p className="text-[#C4A97A] text-xs mb-1">
              Premio reservado
            </p>

            <p className="text-[#D4AF37] font-bold">
              {prize}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.02]"
          style={{
            fontFamily: "'Inter', sans-serif",
            background:
              'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
            animation: 'pulse-glow 2.5s ease-in-out infinite',
          }}
        >
          Ver mi Premio
        </button>

        <p className="mt-3 text-xs text-[#6B5D3F]">
          Te llevamos a tu cuenta automáticamente...
        </p>
      </div>
    </div>
  )
}
