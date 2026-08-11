import { CircleCheck, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import type { LoginStep } from '../login.types'

interface Props {
  step: LoginStep
  resetEmail: string
  vigenciaMinutos: number
}

export default function LoginHeader({ step, resetEmail, vigenciaMinutos }: Props) {
  return (
    <div className="text-center mb-8">
      <img src={logoImg} alt="Gran Casino Cucuta" className="h-16 w-auto mx-auto mb-5" />

      {step === 'login' && (
        <>
          <p
            className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Gran Casino Cucuta
          </p>
          <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Bienvenido nuevamente
          </h1>
          <p className="text-[#6B5D3F] text-sm mt-1">Accede a tu cuenta para ver tus beneficios</p>
        </>
      )}

      {step === 'forgot' && (
        <>
          <KeyRound size={44} className="text-[#D4AF37] mx-auto mb-3" />
          <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Recuperar Contraseña
          </h1>
          <p className="text-[#6B5D3F] text-sm mt-1">Te enviaremos un código de 6 dígitos a tu correo</p>
        </>
      )}

      {step === 'forgot-code' && (
        <>
          <Mail size={44} className="text-[#D4AF37] mx-auto mb-3" />
          <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Revisa tu correo
          </h1>
          <p className="text-[#9A7B50] text-sm mt-2 max-w-xs mx-auto">
            Si <span className="text-[#C4A97A]">{resetEmail}</span> está registrado, te llegó un código de 6 dígitos.
            Vence en {vigenciaMinutos} minutos.
          </p>
        </>
      )}

      {step === 'forgot-new' && (
        <>
          <ShieldCheck size={44} className="text-[#D4AF37] mx-auto mb-3" />
          <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Nueva contraseña
          </h1>
          <p className="text-[#6B5D3F] text-sm mt-1">Código verificado. Elige tu nueva contraseña.</p>
        </>
      )}

      {step === 'forgot-done' && (
        <>
          <CircleCheck size={48} className="text-[#22c55e] mx-auto mb-3" />
          <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            ¡Contraseña actualizada!
          </h1>
          <p className="text-[#9A7B50] text-sm mt-2 max-w-xs mx-auto">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </>
      )}
    </div>
  )
}
