import LoginFeedback from '../components/LoginFeedback'
import LoginPrimaryButton from '../components/LoginPrimaryButton'
import LoginSecondaryButton from '../components/LoginSecondaryButton'

interface Props {
  email: string
  setEmail: (value: string) => void
  loading: boolean
  error: string | null
  onSendCode: () => Promise<void>
  onBack: () => void
}

export default function ForgotEmailSection({ email, setEmail, loading, error, onSendCode, onBack }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Correo electrónico</label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && email.trim()) void onSendCode()
          }}
          className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
        />
        <p className="text-[11px] text-[#6B5D3F] mt-1">Debe ser el mismo correo con el que te registraste.</p>
      </div>

      {error && <LoginFeedback>{error}</LoginFeedback>}

      <LoginPrimaryButton
        onClick={() => void onSendCode()}
        disabled={loading || !email.trim()}
        className="disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Enviando...' : 'Enviarme el código'}
      </LoginPrimaryButton>

      <LoginSecondaryButton onClick={onBack}>Volver al inicio de sesión</LoginSecondaryButton>
    </div>
  )
}
