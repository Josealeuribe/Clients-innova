import LoginFeedback from '../components/LoginFeedback'
import LoginPrimaryButton from '../components/LoginPrimaryButton'
import LoginSecondaryButton from '../components/LoginSecondaryButton'

interface Props {
  newPass: string
  setNewPass: (value: string) => void
  newPassConfirm: string
  setNewPassConfirm: (value: string) => void
  showPass: boolean
  setShowPass: (value: boolean) => void
  loading: boolean
  error: string | null
  onSave: () => Promise<void>
  onCancel: () => void
}

export default function ForgotNewPasswordSection({
  newPass,
  setNewPass,
  newPassConfirm,
  setNewPassConfirm,
  showPass,
  setShowPass,
  loading,
  error,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Nueva contraseña</label>
        <input
          type={showPass ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Confirmar contraseña</label>
        <input
          type={showPass ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          value={newPassConfirm}
          onChange={(e) => setNewPassConfirm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newPass && newPassConfirm) void onSave()
          }}
          className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer -mt-1">
        <input
          type="checkbox"
          checked={showPass}
          onChange={(e) => setShowPass(e.target.checked)}
          className="accent-[#D4AF37]"
        />
        <span className="text-xs text-[#6B5D3F]">Ver contraseñas</span>
      </label>

      <p className="text-[11px] text-[#6B5D3F] leading-relaxed">
        Debe tener al menos 8 caracteres, una mayúscula y un número.
      </p>

      {error && <LoginFeedback>{error}</LoginFeedback>}

      <LoginPrimaryButton
        onClick={() => void onSave()}
        disabled={loading || !newPass || !newPassConfirm}
        className="disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Guardando...' : 'Guardar contraseña'}
      </LoginPrimaryButton>

      <LoginSecondaryButton onClick={onCancel}>Cancelar</LoginSecondaryButton>
    </div>
  )
}
