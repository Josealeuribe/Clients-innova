import type { Page } from '@/shared/types/navigation'
import LoginFeedback from '../components/LoginFeedback'
import LoginPrimaryButton from '../components/LoginPrimaryButton'
import RememberCheckbox from '../components/RememberCheckbox'

interface Props {
  navigate: (page: Page) => void
  email: string
  setEmail: (value: string) => void
  pass: string
  setPass: (value: string) => void
  showPass: boolean
  setShowPass: (value: boolean) => void
  remember: boolean
  setRemember: (value: boolean) => void
  loading: boolean
  error: string | null
  onLogin: () => Promise<void>
  onForgot: () => void
}

export default function LoginSection({
  navigate,
  email,
  setEmail,
  pass,
  setPass,
  showPass,
  setShowPass,
  remember,
  setRemember,
  loading,
  error,
  onLogin,
  onForgot,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Correo o documento</label>
        <input
          type="text"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Contraseña</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Tu contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full px-4 py-3 pr-16 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
          />
          <button
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B5D3F] hover:text-[#D4AF37] transition-colors"
          >
            {showPass ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </div>

      {error && <LoginFeedback>{error}</LoginFeedback>}

      <div className="flex items-center justify-between">
        <RememberCheckbox checked={remember} onChange={setRemember} />
        <button
          onClick={onForgot}
          className="text-xs text-[#9A7B50] hover:text-[#D4AF37] transition-colors underline"
        >
          Olvidé mi contraseña
        </button>
      </div>

      <LoginPrimaryButton
        onClick={() => void onLogin()}
        disabled={loading}
        className="mt-2 active:scale-[0.99]"
      >
        {loading ? '⏳ Ingresando...' : 'Iniciar Sesión'}
      </LoginPrimaryButton>

      <div className="h-px bg-[#D4AF37]/15 my-1" />

      <p className="text-center text-[#6B5D3F] text-xs">
        ¿Aún no tienes una cuenta?{' '}
        <button
          onClick={() => navigate('roulette')}
          className="text-[#D4AF37] font-semibold hover:underline transition-all"
        >
          Gira y regístrate
        </button>
      </p>
    </div>
  )
}
