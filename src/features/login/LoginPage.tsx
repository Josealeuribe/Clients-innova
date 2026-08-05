import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import { ApiError } from '@/shared/api/client'
import BackButton from '@/shared/components/BackButton'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import { Mail, ArrowLeft } from 'lucide-react'

interface Props {
  navigate: (page: Page) => void
}

type LoginStep = 'login' | 'forgot' | 'forgot-sent'

export default function LoginPage({ navigate }: Props) {
  const { login } = useAuth()
  const [loginStep, setLoginStep] = useState<LoginStep>('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState('')

  const handleLogin = async () => {
    setLoginError(null)
    setLoading(true)
    try {
      const response = await login(email, pass)
      if (response.tipo === 'staff') {
        navigate(response.staff.rol === 'admin' ? 'admin' : 'cajero')
      } else {
        navigate('dashboard')
      }
    } catch (error) {
      setLoginError(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setLoginStep('forgot-sent')
    }, 1200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(139,26,26,0.1) 0%, transparent 60%), #0a0805' }}>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at center, #D4AF37 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Glow — puramente decorativo. Sin pointer-events-none, este div
            (posicionado) se pinta encima del botón "Volver a Inicio" de más
            abajo (que no está posicionado), aunque venga antes en el DOM —
            así es como funciona el stacking de CSS — y bloqueaba el clic. */}
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)' }} />

        <div className="relative rounded-3xl border border-[#D4AF37]/20 p-8 md:p-10"
          style={{
            background: 'linear-gradient(145deg, #1C1810, #121009)',
            animation: 'slide-up 0.5s ease-out forwards'
          }}>

          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoImg} alt="Gran Casino Cucuta" className="h-16 w-auto mx-auto mb-5" />

            {loginStep === 'login' && (
              <>
                <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Gran Casino Cucuta
                </p>
                <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Bienvenido nuevamente
                </h1>
                <p className="text-[#6B5D3F] text-sm mt-1">Accede a tu cuenta para ver tus beneficios</p>
              </>
            )}

            {loginStep === 'forgot' && (
              <>
                <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Recuperar Contraseña
                </h1>
                <p className="text-[#6B5D3F] text-sm mt-1">Te enviaremos un enlace a tu correo</p>
              </>
            )}

            {loginStep === 'forgot-sent' && (
              <>
                <Mail size={48} className="text-[#D4AF37] mx-auto mb-3" />
                <h1 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  ¡Correo enviado!
                </h1>
                <p className="text-[#9A7B50] text-sm mt-2 max-w-xs mx-auto">
                  Revisa tu bandeja de entrada en <span className="text-[#C4A97A]">{resetEmail || 'tu correo'}</span> y sigue las instrucciones.
                </p>
              </>
            )}
          </div>

          {/* Login form */}
          {loginStep === 'login' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Correo o documento</label>
                <input
                  type="text"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPass(e.target.value)}
                    className="w-full px-4 py-3 pr-16 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
                  />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B5D3F] hover:text-[#D4AF37] transition-colors">
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                  {loginError}
                </p>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setRemember(!remember)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                      ${remember ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#D4AF37]/30'}`}>
                    {remember && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#0a0805" strokeWidth="2" strokeLinecap="round" /></svg>}
                  </div>
                  <span className="text-xs text-[#6B5D3F]">Recordarme</span>
                </label>
                <button onClick={() => setLoginStep('forgot')} className="text-xs text-[#9A7B50] hover:text-[#D4AF37] transition-colors underline">
                  Olvidé mi contraseña
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="mt-2 w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
                  letterSpacing: '0.06em'
                }}>
                {loading ? '⏳ Ingresando...' : 'Iniciar Sesión'}
              </button>

              <div className="h-px bg-[#D4AF37]/15 my-1" />

              <p className="text-center text-[#6B5D3F] text-xs">
                ¿Aún no tienes una cuenta?{' '}
                <button onClick={() => navigate('roulette')} className="text-[#D4AF37] font-semibold hover:underline transition-all">
                  Gira y regístrate
                </button>
              </p>
            </div>
          )}

          {/* Forgot form */}
          {loginStep === 'forgot' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
                />
              </div>

              <button
                onClick={handleForgot}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] disabled:opacity-60"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
                  letterSpacing: '0.06em'
                }}>
                {loading ? '⏳ Enviando...' : 'Enviar Enlace'}
              </button>

              <button onClick={() => setLoginStep('login')}
                className="w-full py-3 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all inline-flex items-center justify-center gap-1.5">
                <ArrowLeft size={14} /> Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* Forgot sent */}
          {loginStep === 'forgot-sent' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setLoginStep('login')}
                className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
                  letterSpacing: '0.06em'
                }}>
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>

        {/* Volver siempre a Inicio */}
        <div className="text-center mt-6">
          <BackButton className="text-[#9A7B50] text-sm hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5 justify-center" />
        </div>
      </div>
    </div>
  )
}
