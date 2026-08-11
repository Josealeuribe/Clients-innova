import LoginFeedback from '../components/LoginFeedback'
import LoginPrimaryButton from '../components/LoginPrimaryButton'
import LoginSecondaryButton from '../components/LoginSecondaryButton'

interface Props {
  code: string
  setCode: (value: string) => void
  codeComplete: boolean
  loading: boolean
  error: string | null
  notice: string | null
  onVerify: () => Promise<void>
  onResend: () => Promise<void>
  onChangeEmail: () => void
}

export default function ForgotCodeSection({
  code,
  setCode,
  codeComplete,
  loading,
  error,
  notice,
  onVerify,
  onResend,
  onChangeEmail,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Código de 6 dígitos</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && codeComplete) void onVerify()
          }}
          className="w-full px-4 py-3 rounded-xl text-center text-2xl font-bold tracking-[0.5em] text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#2A2318] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
        />
      </div>

      {notice && <LoginFeedback type="notice">{notice}</LoginFeedback>}
      {error && <LoginFeedback>{error}</LoginFeedback>}

      <LoginPrimaryButton
        onClick={() => void onVerify()}
        disabled={loading || !codeComplete}
        className="disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Verificando...' : 'Verificar código'}
      </LoginPrimaryButton>

      <p className="text-center text-[#6B5D3F] text-xs">
        ¿No te llegó? Revisa tu carpeta de spam o{' '}
        <button
          onClick={() => void onResend()}
          disabled={loading}
          className="text-[#D4AF37] font-semibold hover:underline disabled:opacity-60"
        >
          pide uno nuevo
        </button>
      </p>

      <LoginSecondaryButton onClick={onChangeEmail}>Cambiar el correo</LoginSecondaryButton>
    </div>
  )
}
