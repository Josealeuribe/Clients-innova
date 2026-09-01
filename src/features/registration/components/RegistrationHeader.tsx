import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import type { RegistrationStep } from '../registration.types'

interface Props {
  step: RegistrationStep
  onBack: () => void
  onCancel: () => void
}

export default function RegistrationHeader({
  step,
  onBack,
  onCancel,
}: Props) {
  return (
    <div
      className="sticky top-0 z-30 pt-4 pb-4 mb-6"
      style={{
        background: 'rgba(10,8,5,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
      }}
    >
      <div className="max-w-lg mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={step > 1 ? onBack : onCancel}
            className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-1"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>

            {step > 1 ? 'Volver' : 'Cancelar'}
          </button>

          <img
            src={logoImg}
            alt="Gran Casino Cucuta"
            className="h-9 w-auto"
          />

          <span
            className="text-[#6B5D3F] text-xs"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Paso {step} de 4
          </span>
        </div>

        <div className="w-full bg-[#1C1810] rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${(step / 4) * 100}%`,
              background:
                'linear-gradient(90deg, #A0832A, #D4AF37, #F0C847)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
