import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import type { RegistrationStep } from '../registration.types'

interface Props {
  step: RegistrationStep
  loading: boolean
  submitError: string | null
  onNext: () => void
  onBack: () => void
  onSubmit: () => void
}

export default function RegistrationActions({
  step,
  loading,
  submitError,
  onNext,
  onBack,
  onSubmit,
}: Props) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      {submitError && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
          {submitError}
        </p>
      )}

      <button
        type="button"
        onClick={step < 4 ? onNext : onSubmit}
        disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 inline-flex items-center justify-center gap-2"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
          letterSpacing: '0.06em',
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Creando tu cuenta...
          </>
        ) : step < 4 ? (
          <>
            Continuar
            <ArrowRight size={16} />
          </>
        ) : (
          'Crear Cuenta y Reclamar Premio'
        )}
      </button>

      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all inline-flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Volver
        </button>
      )}
    </div>
  )
}
