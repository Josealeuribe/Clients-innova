import { useEffect, useState } from 'react'
import { Trophy, CircleCheck, Circle, Loader2, ArrowLeft, ArrowRight, TriangleAlert, FileText, ShieldCheck } from 'lucide-react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import { useNavigation } from '@/shared/context/NavigationContext'
import { ApiError, checkDisponibilidad, fetchUbicaciones } from '@/shared/api/client'
import type { DepartamentoApi } from '@/shared/api/types'
import { useCampoBorrador, useRegistrationDraft } from '@/shared/context/RegistrationDraftContext'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'

interface Props {
  navigate: (page: Page) => void
  prize: string | null
  ticket: string | null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_EDAD = 18
const MAX_EDAD = 100

function edadDesdeFecha(fechaISO: string): number {
  const nacimiento = new Date(fechaISO)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  if (aunNoCumple) edad--
  return edad
}

function Input({ label, type = 'text', placeholder, value, onChange, error, checking, disabled = false }:
  { label: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void; error?: string; checking?: boolean; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">{label}</label>
      <div className="relative">
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
        {checking && (
          <Loader2 size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D3F]" />
        )}
      </div>
      {error && (
        <span className="text-red-400 text-xs flex items-center gap-1">
          <TriangleAlert size={12} className="flex-shrink-0" /> {error}
        </span>
      )}
    </div>
  )
}

function Select({ label, options, value, onChange, disabled = false, placeholder, error }:
  { label: string; options: string[]; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl text-sm bg-[#121009] border transition-all outline-none
          focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? 'border-red-500/60' : 'border-[#D4AF37]/20'}
          ${value ? 'text-[#F5E6C8]' : 'text-[#4A3D28]'}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o} className="bg-[#1C1810]">{o}</option>)}
      </select>
      {error && (
        <span className="text-red-400 text-xs flex items-center gap-1">
          <TriangleAlert size={12} className="flex-shrink-0" /> {error}
        </span>
      )}
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

export default function RegistrationPage({ navigate, prize, ticket }: Props) {
  const { register } = useAuth()
  const { goHome, hrefFor } = useNavigation()
  const { limpiar: limpiarBorrador } = useRegistrationDraft()
  // Los campos usan useCampoBorrador en vez de useState: así salir a leer los
  // términos y volver conserva lo escrito y el paso en el que iba. El
  // borrador vive en memoria (ver RegistrationDraftContext).
  const [step, setStep] = useCampoBorrador('step', 1)
  const [attemptedNext, setAttemptedNext] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1
  const [nombres, setNombres] = useCampoBorrador('nombres', '')
  const [apellidos, setApellidos] = useCampoBorrador('apellidos', '')
  const [docType, setDocType] = useCampoBorrador('docType', '')
  const [docNum, setDocNum] = useCampoBorrador('docNum', '')
  const [birth, setBirth] = useCampoBorrador('birth', '')
  const [phone, setPhone] = useCampoBorrador('phone', '')
  const [docNumDisponible, setDocNumDisponible] = useState<boolean | null>(null)

  // Departamentos y municipios vienen del backend, de la misma tabla contra
  // la que valida el registro. Antes eran una constante local, así que podían
  // desincronizarse sin que nadie se enterara.
  const [ubicaciones, setUbicaciones] = useState<DepartamentoApi[]>([])
  const [ubicacionesError, setUbicacionesError] = useState<string | null>(null)

  useEffect(() => {
    fetchUbicaciones()
      .then((res) => setUbicaciones(res.departamentos))
      .catch(() =>
        setUbicacionesError('No se pudo cargar la lista de departamentos. Revisa tu conexión y recarga la página.'),
      )
  }, [])

  const [checkingDocNum, setCheckingDocNum] = useState(false)

  // Step 2
  const [dept, setDept] = useCampoBorrador('dept', '')
  const [city, setCity] = useCampoBorrador('city', '')

  // Derivados de las ubicaciones. Van aquí y no junto al fetch porque
  // `municipiosDelDepartamento` lee `dept`: declararlos antes compila sin
  // quejas (la referencia está dentro de un callback, TypeScript no puede
  // saber que .find() lo ejecuta de inmediato) pero revienta en runtime.
  const nombresDepartamentos = ubicaciones.map((d) => d.nombre)
  const municipiosDelDepartamento = ubicaciones.find((d) => d.nombre === dept)?.municipios ?? []

  // Step 3
  const [email, setEmail] = useCampoBorrador('email', '')
  const [pass, setPass] = useCampoBorrador('pass', '')
  const [passConfirm, setPassConfirm] = useCampoBorrador('passConfirm', '')
  const [showPass, setShowPass] = useState(false)
  const [emailDisponible, setEmailDisponible] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  // Step 4
  const [terminos, setTerminos] = useCampoBorrador('terminos', false)
  const [datos, setDatos] = useCampoBorrador('datos', false)
  const [edad, setEdad] = useCampoBorrador('edad', false)
  const [promo, setPromo] = useCampoBorrador('promo', false)
  const [comms, setComms] = useCampoBorrador('comms', false)

  const allConfirmed = terminos && datos && edad && promo && comms
  const toggleAllConfirmations = (checked: boolean) => {
    setTerminos(checked)
    setDatos(checked)
    setEdad(checked)
    setPromo(checked)
    setComms(checked)
  }

  // --- Validaciones en tiempo real (no solo al enviar el formulario) ---

  const docNumFormatError =
    docNum.trim().length > 0 && docNum.trim().length < 5
      ? 'El documento debe tener al menos 5 caracteres.'
      : docNum.trim().length > 0 && docType !== 'Pasaporte' && !/^\d+$/.test(docNum.trim())
      ? 'Este tipo de documento solo debe contener números.'
      : ''
  const docNumError = docNumFormatError || (docNumDisponible === false ? 'Ya existe una cuenta registrada con este documento.' : '')

  const birthError = (() => {
    if (!birth) return ''
    const fecha = new Date(birth)
    if (Number.isNaN(fecha.getTime())) return 'Ingresa una fecha válida.'
    if (fecha.getTime() > Date.now()) return 'La fecha de nacimiento no puede ser futura.'
    const edadCalculada = edadDesdeFecha(birth)
    if (edadCalculada < MIN_EDAD) return `Debes ser mayor de ${MIN_EDAD} años para registrarte.`
    if (edadCalculada > MAX_EDAD) return 'Verifica la fecha ingresada.'
    return ''
  })()

  const phoneError =
    phone.trim().length > 0 && phone.replace(/\D/g, '').length < 7 ? 'Ingresa un número de celular válido.' : ''

  const nombresError = attemptedNext && !nombres.trim() ? 'Este campo es obligatorio.' : ''
  const apellidosError = attemptedNext && !apellidos.trim() ? 'Este campo es obligatorio.' : ''
  const docTypeError = attemptedNext && !docType ? 'Selecciona un tipo de documento.' : ''
  const docNumRequiredError = attemptedNext && !docNum.trim() ? 'Este campo es obligatorio.' : ''
  const birthRequiredError = attemptedNext && !birth ? 'Este campo es obligatorio.' : ''
  const phoneRequiredError = attemptedNext && !phone.trim() ? 'Este campo es obligatorio.' : ''

  const deptError = attemptedNext && !dept ? 'Selecciona un departamento.' : ''
  const cityError = attemptedNext && !city ? 'Selecciona una ciudad.' : ''

  const emailFormatError = email.trim().length > 0 && !EMAIL_REGEX.test(email.trim()) ? 'Ingresa un correo válido.' : ''
  const emailError = emailFormatError || (emailDisponible === false ? 'Ya existe una cuenta registrada con este correo.' : '')
  const emailRequiredError = attemptedNext && !email.trim() ? 'Este campo es obligatorio.' : ''

  const passStrength = pass.length === 0 ? 0 : pass.length < 6 ? 1 : pass.length < 10 ? 2 : /[A-Z]/.test(pass) && /[0-9]/.test(pass) ? 4 : 3
  const passLabels = ['', 'Muy débil', 'Débil', 'Buena', 'Fuerte']
  const passColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const passValid = pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)
  const passConfirmError = passConfirm.length > 0 && pass !== passConfirm ? 'Las contraseñas no coinciden.' : ''

  // Chequeo de disponibilidad con debounce: no golpea el backend en cada
  // tecla, espera medio segundo desde el último cambio y solo si el formato
  // ya es válido (no tiene sentido consultar un documento de 2 caracteres).
  useEffect(() => {
    setDocNumDisponible(null)
    if (!docNum.trim() || docNumFormatError) return
    setCheckingDocNum(true)
    const timeout = setTimeout(() => {
      checkDisponibilidad({ docNum: docNum.trim() })
        .then((res) => setDocNumDisponible(res.docNumDisponible ?? null))
        .catch(() => setDocNumDisponible(null))
        .finally(() => setCheckingDocNum(false))
    }, 500)
    return () => {
      clearTimeout(timeout)
      setCheckingDocNum(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docNum, docType])

  useEffect(() => {
    setEmailDisponible(null)
    if (!email.trim() || emailFormatError) return
    setCheckingEmail(true)
    const timeout = setTimeout(() => {
      checkDisponibilidad({ email: email.trim() })
        .then((res) => setEmailDisponible(res.emailDisponible ?? null))
        .catch(() => setEmailDisponible(null))
        .finally(() => setCheckingEmail(false))
    }, 500)
    return () => {
      clearTimeout(timeout)
      setCheckingEmail(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  // Tras registrarse, el cliente termina en su propia vista: ahí están su
  // bono, el código que debe presentar en sede y el historial. Se deja unos
  // segundos la pantalla de éxito para que alcance a ver el premio reservado.
  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => navigate('dashboard'), 3500)
    return () => clearTimeout(timeout)
  }, [success, navigate])

  const step1Valid =
    !!nombres.trim() && !!apellidos.trim() && !!docType && !!docNum.trim() && !docNumError &&
    docNumDisponible !== false && !!birth && !birthError && !!phone.trim() && !phoneError
  const step2Valid = !!dept && !!city
  const step3Valid = !!email.trim() && !emailError && emailDisponible !== false && passValid && pass === passConfirm
  const step4Valid = terminos && datos && edad && promo

  const isStepValid = step === 1 ? step1Valid : step === 2 ? step2Valid : step === 3 ? step3Valid : step4Valid

  const next = () => {
    if (!isStepValid) {
      setAttemptedNext(true)
      return
    }
    setAttemptedNext(false)
    if (step < 4) setStep(s => s + 1)
  }
  const back = () => {
    setAttemptedNext(false)
    if (step > 1) setStep(s => s - 1)
  }

  const submit = async () => {
    if (!isStepValid) {
      setAttemptedNext(true)
      return
    }
    setSubmitError(null)
    setLoading(true)
    try {
      await register({
        nombres,
        apellidos,
        docType,
        docNum,
        birth,
        phone,
        dept,
        city,
        email,
        pass,
        passConfirm,
        terminos,
        datos,
        edad,
        promo,
        comms,
        ticket,
      })
      // La cuenta ya existe: el borrador (con la contraseña) deja de tener
      // motivo para seguir en memoria.
      limpiarBorrador()
      setSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'No se pudo crear tu cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), #0a0805' }}>
        <div className="max-w-md w-full text-center" style={{ animation: 'modal-in 0.5s ease-out forwards' }}>
          <Trophy size={80} className="text-[#D4AF37] mx-auto mb-6" style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))' }} />
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            REGISTRO EXITOSO
          </p>
          <h1 className="text-3xl font-black text-[#F5E6C8] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            ¡Tu cuenta fue creada correctamente!
          </h1>
          <p className="text-[#9A7B50] mb-6">Tu premio ya se encuentra disponible en tu perfil. Bienvenido a Gran Casino Cucuta.</p>

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
          <p className="mt-3 text-xs text-[#6B5D3F]">
            Te llevamos a tu cuenta automáticamente...
          </p>
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
            <button onClick={() => step > 1 ? back() : goHome()}
              className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              {step > 1 ? 'Volver' : 'Cancelar'}
            </button>
            <img src={logoImg} alt="Gran Casino Cucuta" className="h-9 w-auto" />
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
            <Trophy size={24} className="text-[#D4AF37] flex-shrink-0" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombres" placeholder="Juan Camilo" value={nombres} onChange={setNombres} error={nombresError} />
              <Input label="Apellidos" placeholder="Rodríguez" value={apellidos} onChange={setApellidos} error={apellidosError} />
            </div>
            <Select
              label="Tipo de Documento"
              options={['Cédula de Ciudadanía', 'Pasaporte', 'Tarjeta de Extranjería']}
              value={docType}
              onChange={setDocType}
              placeholder="Selecciona..."
              error={docTypeError}
            />
            <Input
              label="Número de Documento"
              placeholder="1012345678"
              value={docNum}
              onChange={setDocNum}
              error={docNumError || docNumRequiredError}
              checking={checkingDocNum}
            />
            <Input label="Fecha de Nacimiento" type="date" placeholder="" value={birth} onChange={setBirth} error={birthError || birthRequiredError} />
            <Input label="Número de Celular" type="tel" placeholder="+57 300 1234567" value={phone} onChange={setPhone} error={phoneError || phoneRequiredError} />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Select
              label="Departamento"
              options={nombresDepartamentos}
              value={dept}
              onChange={v => { setDept(v); setCity('') }}
              placeholder={ubicaciones.length ? 'Selecciona un departamento...' : 'Cargando departamentos...'}
              disabled={!ubicaciones.length}
              error={deptError || ubicacionesError || ''}
            />
            <Select
              label="Ciudad"
              options={municipiosDelDepartamento}
              value={city}
              onChange={setCity}
              disabled={!dept}
              placeholder={dept ? 'Selecciona una ciudad...' : 'Selecciona primero un departamento'}
              error={cityError}
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
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={setEmail}
              error={emailError || emailRequiredError}
              checking={checkingEmail}
            />
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
                      {met ? <CircleCheck size={13} /> : <Circle size={13} />} {req}
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
                  ${passConfirmError ? 'border-red-500/60' : 'border-[#D4AF37]/20 focus:border-[#D4AF37]/60'}`}
              />
              {passConfirmError && (
                <span className="text-red-400 text-xs flex items-center gap-1">
                  <TriangleAlert size={12} className="flex-shrink-0" /> {passConfirmError}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <Checkbox label="Acepto los términos y condiciones de Gran Casino Cucuta." checked={terminos} onChange={setTerminos} required />
            <Checkbox label="Autorizo el tratamiento de mis datos personales conforme a la política de privacidad." checked={datos} onChange={setDatos} required />
            <Checkbox label="Confirmo que soy mayor de 18 años." checked={edad} onChange={setEdad} required />
            <Checkbox label="Acepto las condiciones de la promoción vigente." checked={promo} onChange={setPromo} required />
            <div className="h-px bg-[#D4AF37]/15 my-1" />
            <Checkbox label="Acepto recibir comunicaciones promocionales de Gran Casino Cucuta. (Opcional)" checked={comms} onChange={setComms} />
            <div className="h-px bg-[#D4AF37]/15 my-1" />
            <Checkbox label="Seleccionar todo" checked={allConfirmed} onChange={toggleAllConfirmations} />
            {attemptedNext && !step4Valid && (
              <span className="text-red-400 text-xs flex items-center gap-1">
                <TriangleAlert size={12} className="flex-shrink-0" /> Debes aceptar todas las condiciones obligatorias para continuar.
              </span>
            )}

            {/* Enlaces a los documentos que se están aceptando. Son <a> con
                href real para que se puedan abrir en otra pestaña, pero el
                clic normal navega dentro de la app: al volver, el formulario
                sigue como estaba (ver RegistrationDraftContext). */}
            <div className="mt-2 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 px-4 py-3">
              <p className="text-xs text-[#9A7B50] mb-2">Antes de aceptar, puedes consultar:</p>
              <div className="flex flex-col gap-1.5">
                <a
                  href={hrefFor('terms')}
                  onClick={(e) => { e.preventDefault(); navigate('terms') }}
                  className="text-xs text-[#D4AF37] hover:text-[#F0C847] underline inline-flex items-center gap-1.5 w-fit"
                >
                  <FileText size={13} className="flex-shrink-0" /> Términos y condiciones
                </a>
                <a
                  href={hrefFor('privacy')}
                  onClick={(e) => { e.preventDefault(); navigate('privacy') }}
                  className="text-xs text-[#D4AF37] hover:text-[#F0C847] underline inline-flex items-center gap-1.5 w-fit"
                >
                  <ShieldCheck size={13} className="flex-shrink-0" /> Política de privacidad
                </a>
              </div>
              <p className="text-[10px] text-[#6B5D3F] mt-2">
                Al volver retomarás el registro donde lo dejaste.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          {submitError && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}
          <button
            onClick={step < 4 ? next : submit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 inline-flex items-center justify-center gap-2"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
              letterSpacing: '0.06em'
            }}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creando tu cuenta...
              </>
            ) : step < 4 ? (
              <>
                Continuar <ArrowRight size={16} />
              </>
            ) : (
              'Crear Cuenta y Reclamar Premio'
            )}
          </button>

          {step > 1 && (
            <button onClick={back}
              className="w-full py-3 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all inline-flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} /> Volver
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
