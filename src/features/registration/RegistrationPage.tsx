import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/logo.png'

interface Props {
  navigate: (page: Page) => void
  prize: string | null
  onRegister: (name: string) => void
}

const DEPARTMENTS = ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander', 'Bolívar']
const CITIES: Record<string, string[]> = {
  'Cundinamarca': ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá'],
  'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta'],
  'Bolívar': ['Cartagena', 'Magangué', 'El Carmen de Bolívar', 'Mompox'],
}

function Input({ label, type = 'text', placeholder, value, onChange, error, disabled = false }:
  { label: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border transition-all outline-none
          placeholder:text-[#4A3D28] disabled:opacity-40 disabled:cursor-not-allowed
          focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20
          ${error ? 'border-red-500/60' : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/35'}`}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}

function Select({ label, options, value, onChange, disabled = false, placeholder }:
  { label: string; options: string[]; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl text-sm bg-[#121009] border border-[#D4AF37]/20 transition-all outline-none
          focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20
          disabled:opacity-40 disabled:cursor-not-allowed
          ${value ? 'text-[#F5E6C8]' : 'text-[#4A3D28]'}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o} className="bg-[#1C1810]">{o}</option>)}
      </select>
    </div>
  )
}

function Checkbox({ label, checked, onChange, required = false }:
  { label: string; checked: boolean; onChange: (v: boolean) => void; required?: boolean }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all
          ${checked ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60'}`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#0a0805" strokeWidth="2" strokeLinecap="round" /></svg>}
      </div>
      <span className="text-sm text-[#9A7B50] leading-relaxed">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </span>
    </label>
  )
}

export default function RegistrationPage({ navigate, prize, onRegister }: Props) {
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [docType, setDocType] = useState('')
  const [docNum, setDocNum] = useState('')
  const [birth, setBirth] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2
  const [dept, setDept] = useState('')
  const [city, setCity] = useState('')

  // Step 3
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Step 4
  const [terminos, setTerminos] = useState(false)
  const [datos, setDatos] = useState(false)
  const [edad, setEdad] = useState(false)
  const [promo, setPromo] = useState(false)
  const [comms, setComms] = useState(false)

  const allConfirmed = terminos && datos && edad && promo && comms
  const toggleAllConfirmations = (checked: boolean) => {
    setTerminos(checked)
    setDatos(checked)
    setEdad(checked)
    setPromo(checked)
    setComms(checked)
  }

  const passStrength = pass.length === 0 ? 0 : pass.length < 6 ? 1 : pass.length < 10 ? 2 : /[A-Z]/.test(pass) && /[0-9]/.test(pass) ? 4 : 3
  const passLabels = ['', 'Muy débil', 'Débil', 'Buena', 'Fuerte']
  const passColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

  const next = () => {
    if (step < 4) setStep(s => s + 1)
  }
  const back = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      onRegister(nombres + ' ' + apellidos)
      setLoading(false)
      setSuccess(true)
    }, 1800)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), #0a0805' }}>
        <div className="max-w-md w-full text-center" style={{ animation: 'modal-in 0.5s ease-out forwards' }}>
          <div className="text-8xl mb-6" style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))' }}>🏆</div>
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            REGISTRO EXITOSO
          </p>
          <h1 className="text-3xl font-black text-[#F5E6C8] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            ¡Tu cuenta fue creada correctamente!
          </h1>
          <p className="text-[#9A7B50] mb-6">Tu premio ya se encuentra disponible en tu perfil. Bienvenido a Innova Club SAS.</p>

          {prize && (
            <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/8 p-4 mb-6 text-sm">
              <p className="text-[#C4A97A] text-xs mb-1">Premio reservado</p>
              <p className="text-[#D4AF37] font-bold">{prize}</p>
            </div>
          )}

          <button
            onClick={() => navigate('dashboard')}
            className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.02]"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
              animation: 'pulse-glow 2.5s ease-in-out infinite'
            }}>
            Ver mi Premio
          </button>
          <button onClick={() => navigate('login')} className="mt-3 text-sm text-[#6B5D3F] hover:text-[#9A7B50] transition-colors">
            Ir a mi cuenta
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 px-4" style={{ background: '#0a0805' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 pt-4 pb-4 mb-6"
        style={{ background: 'rgba(10,8,5,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="max-w-lg mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full">
            <button onClick={() => step > 1 ? back() : navigate('roulette')}
              className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              {step > 1 ? 'Volver' : 'Cancelar'}
            </button>
            <img src={logoImg} alt="Innova Club" className="h-9 w-auto" />
            <span className="text-[#6B5D3F] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Paso {step} de 4</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#1C1810] rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%`, background: 'linear-gradient(90deg, #A0832A, #D4AF37, #F0C847)' }} />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Prize banner */}
        {prize && (
          <div className="rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/6 px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-[#D4AF37] text-xs font-bold tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>PREMIO RESERVADO</p>
              <p className="text-[#C4A97A] text-sm font-semibold">{prize}</p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-black text-[#F5E6C8] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {['Datos Personales', 'Ubicación', 'Datos de Acceso', 'Confirmaciones'][step - 1]}
        </h2>
        <p className="text-[#6B5D3F] text-sm mb-8">
          {['Ingresa tu información personal para crear tu cuenta.', 'Selecciona tu departamento y ciudad.', 'Crea tu usuario y contraseña.', 'Acepta los términos para completar tu registro.'][step - 1]}
        </p>

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombres" placeholder="Juan Camilo" value={nombres} onChange={setNombres} />
              <Input label="Apellidos" placeholder="Rodríguez" value={apellidos} onChange={setApellidos} />
            </div>
            <Select label="Tipo de Documento" options={['Cédula de Ciudadanía', 'Pasaporte', 'Tarjeta de Extranjería']} value={docType} onChange={setDocType} placeholder="Selecciona..." />
            <Input label="Número de Documento" placeholder="1012345678" value={docNum} onChange={setDocNum} />
            <Input label="Fecha de Nacimiento" type="date" placeholder="" value={birth} onChange={setBirth} />
            <Input label="Número de Celular" type="tel" placeholder="+57 300 1234567" value={phone} onChange={setPhone} />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Select label="Departamento" options={DEPARTMENTS} value={dept} onChange={v => { setDept(v); setCity('') }} placeholder="Selecciona un departamento..." />
            <Select
              label="Ciudad"
              options={dept ? CITIES[dept] : []}
              value={city}
              onChange={setCity}
              disabled={!dept}
              placeholder={dept ? 'Selecciona una ciudad...' : 'Selecciona primero un departamento'}
            />
            {!dept && (
              <p className="text-[#6B5D3F] text-xs flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                Selecciona un departamento para activar la selección de ciudad.
              </p>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Input label="Correo Electrónico" type="email" placeholder="tucorreo@ejemplo.com" value={email} onChange={setEmail} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20 pr-12"
                />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D3F] hover:text-[#D4AF37] transition-colors text-xs">
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {pass && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(n => (
                      <div key={n} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: n <= passStrength ? passColors[passStrength] : '#2A2018' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: passColors[passStrength] }}>{passLabels[passStrength]}</span>
                </div>
              )}
              <div className="mt-2 space-y-1">
                {['Mínimo 8 caracteres', 'Una letra mayúscula', 'Un número'].map((req, i) => {
                  const met = i === 0 ? pass.length >= 8 : i === 1 ? /[A-Z]/.test(pass) : /[0-9]/.test(pass)
                  return (
                    <p key={i} className="text-xs flex items-center gap-1.5" style={{ color: met ? '#22c55e' : '#6B5D3F' }}>
                      {met ? '✓' : '○'} {req}
                    </p>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">Confirmar Contraseña</label>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={passConfirm}
                onChange={e => setPassConfirm(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border transition-all outline-none placeholder:text-[#4A3D28] focus:ring-1 focus:ring-[#D4AF37]/20
                  ${passConfirm && pass !== passConfirm ? 'border-red-500/60' : 'border-[#D4AF37]/20 focus:border-[#D4AF37]/60'}`}
              />
              {passConfirm && pass !== passConfirm && (
                <span className="text-red-400 text-xs">Las contraseñas no coinciden.</span>
              )}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <Checkbox label="Seleccionar todo" checked={allConfirmed} onChange={toggleAllConfirmations} />
            <div className="h-px bg-[#D4AF37]/15 my-1" />
            <Checkbox label="Acepto los términos y condiciones de Innova Club SAS." checked={terminos} onChange={setTerminos} required />
            <Checkbox label="Autorizo el tratamiento de mis datos personales conforme a la política de privacidad." checked={datos} onChange={setDatos} required />
            <Checkbox label="Confirmo que soy mayor de 18 años." checked={edad} onChange={setEdad} required />
            <Checkbox label="Acepto las condiciones de la promoción vigente." checked={promo} onChange={setPromo} required />
            <div className="h-px bg-[#D4AF37]/15 my-1" />
            <Checkbox label="Acepto recibir comunicaciones promocionales de Innova Club SAS. (Opcional)" checked={comms} onChange={setComms} />
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={step < 4 ? next : submit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
              letterSpacing: '0.06em'
            }}>
            {loading ? '⏳ Creando tu cuenta...' : step < 4 ? 'Continuar →' : 'Crear Cuenta y Reclamar Premio'}
          </button>

          {step > 1 && (
            <button onClick={back}
              className="w-full py-3 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all">
              ← Volver
            </button>
          )}
        </div>

        <p className="text-center text-[#3A3020] text-xs mt-6">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('login')} className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors underline">
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  )
}
