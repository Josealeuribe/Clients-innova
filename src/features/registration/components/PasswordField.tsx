import { Circle, CircleCheck, TriangleAlert } from 'lucide-react'
import {
  PASS_COLORS,
  PASS_LABELS,
} from '../utils/registrationValidators'

interface Props {
  pass: string
  setPass: (value: string) => void
  passConfirm: string
  setPassConfirm: (value: string) => void
  showPass: boolean
  setShowPass: (value: boolean) => void
  passStrength: number
  passConfirmError: string
}

export default function PasswordField({
  pass,
  setPass,
  passConfirm,
  setPassConfirm,
  showPass,
  setShowPass,
  passStrength,
  passConfirmError,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">
          Contraseña
        </label>

        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={pass}
            onChange={(event) => setPass(event.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20 pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D3F] hover:text-[#D4AF37] transition-colors text-xs"
          >
            {showPass ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        {pass && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{
                    background:
                      level <= passStrength
                        ? PASS_COLORS[passStrength]
                        : '#2A2018',
                  }}
                />
              ))}
            </div>

            <span
              className="text-xs"
              style={{ color: PASS_COLORS[passStrength] }}
            >
              {PASS_LABELS[passStrength]}
            </span>
          </div>
        )}

        <div className="mt-2 space-y-1">
          {[
            {
              label: 'Mínimo 8 caracteres',
              met: pass.length >= 8,
            },
            {
              label: 'Una letra mayúscula',
              met: /[A-Z]/.test(pass),
            },
            {
              label: 'Un número',
              met: /[0-9]/.test(pass),
            },
          ].map((requirement) => (
            <p
              key={requirement.label}
              className="text-xs flex items-center gap-1.5"
              style={{
                color: requirement.met ? '#22c55e' : '#6B5D3F',
              }}
            >
              {requirement.met
                ? <CircleCheck size={13} />
                : <Circle size={13} />}

              {requirement.label}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">
          Confirmar Contraseña
        </label>

        <input
          type={showPass ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          value={passConfirm}
          onChange={(event) => setPassConfirm(event.target.value)}
          className={`w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border transition-all outline-none placeholder:text-[#4A3D28] focus:ring-1 focus:ring-[#D4AF37]/20
            ${passConfirmError
              ? 'border-red-500/60'
              : 'border-[#D4AF37]/20 focus:border-[#D4AF37]/60'}`}
        />

        {passConfirmError && (
          <span className="text-red-400 text-xs flex items-center gap-1">
            <TriangleAlert size={12} className="flex-shrink-0" />
            {passConfirmError}
          </span>
        )}
      </div>
    </>
  )
}
