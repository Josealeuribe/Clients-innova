import { useNavigation } from '@/shared/context/NavigationContext'
import RegistrationHeader from './components/RegistrationHeader'
import PrizeBanner from './components/PrizeBanner'
import RegistrationActions from './components/RegistrationActions'
import PersonalDataSection from './sections/PersonalDataSection'
import LocationSection from './sections/LocationSection'
import AccessDataSection from './sections/AccessDataSection'
import ConfirmationsSection from './sections/ConfirmationsSection'
import RegistrationSuccessSection from './sections/RegistrationSuccessSection'
import { useRegistrationFields } from './hooks/useRegistrationFields'
import { useUbicaciones } from './hooks/useUbicaciones'
import { useDisponibilidadRegistro } from './hooks/useDisponibilidadRegistro'
import { useRegistrationValidation } from './hooks/useRegistrationValidation'
import { useRegistrationSubmit } from './hooks/useRegistrationSubmit'
import { STEP_CONTENT } from './utils/registrationContent'
import {
  getDocumentFormatError,
  getEmailFormatError,
} from './utils/registrationValidators'
import type { RegistrationPageProps, RegistrationStep } from './registration.types'

export default function RegistrationPage({
  navigate,
  prize,
  ticket,
}: RegistrationPageProps) {
  const { goHome, hrefFor } = useNavigation()
  const fields = useRegistrationFields()

  const ubicaciones = useUbicaciones(fields.dept)

  const docNumFormatError = getDocumentFormatError(
    fields.docNum,
    fields.docType,
  )

  const emailFormatError = getEmailFormatError(fields.email)

  const disponibilidad = useDisponibilidadRegistro({
    docNum: fields.docNum,
    docType: fields.docType,
    docNumFormatError,
    email: fields.email,
    emailFormatError,
  })

  const validation = useRegistrationValidation({
    step: fields.step,
    attemptedNext: fields.attemptedNext,

    nombres: fields.nombres,
    apellidos: fields.apellidos,
    docType: fields.docType,
    docNum: fields.docNum,
    birth: fields.birth,
    phone: fields.phone,
    docNumDisponible: disponibilidad.docNumDisponible,

    dept: fields.dept,
    city: fields.city,

    email: fields.email,
    pass: fields.pass,
    passConfirm: fields.passConfirm,
    emailDisponible: disponibilidad.emailDisponible,

    terminos: fields.terminos,
    datos: fields.datos,
    edad: fields.edad,
    promo: fields.promo,
    comms: fields.comms,
  })

  const { submit } = useRegistrationSubmit({
    navigate,
    ticket,
    isStepValid: validation.isStepValid,

    nombres: fields.nombres,
    apellidos: fields.apellidos,
    docType: fields.docType,
    docNum: fields.docNum,
    birth: fields.birth,
    phone: fields.phone,
    dept: fields.dept,
    city: fields.city,
    email: fields.email,
    pass: fields.pass,
    passConfirm: fields.passConfirm,
    terminos: fields.terminos,
    datos: fields.datos,
    edad: fields.edad,
    promo: fields.promo,
    comms: fields.comms,

    success: fields.success,
    setSuccess: fields.setSuccess,
    loading: fields.loading,
    setLoading: fields.setLoading,
    setSubmitError: fields.setSubmitError,
    setAttemptedNext: fields.setAttemptedNext,
  })

  const next = () => {
    if (!validation.isStepValid) {
      fields.setAttemptedNext(true)
      return
    }

    fields.setAttemptedNext(false)

    if (fields.step < 4) {
      fields.setStep((fields.step + 1) as RegistrationStep)
    }
  }

  const back = () => {
    fields.setAttemptedNext(false)

    if (fields.step > 1) {
      fields.setStep((fields.step - 1) as RegistrationStep)
    }
  }

  if (fields.success) {
    return (
      <RegistrationSuccessSection
        navigate={navigate}
        prize={prize}
      />
    )
  }

  const currentStep = STEP_CONTENT[fields.step]

  return (
    <div
      className="min-h-screen pb-16 px-4"
      style={{ background: '#0a0805' }}
    >
      <RegistrationHeader
        step={fields.step}
        onBack={back}
        onCancel={goHome}
      />

      <div className="max-w-lg mx-auto">
        <PrizeBanner prize={prize} />

        {/* Tarjeta del formulario: borde dorado, fondo con textura y el
            encabezado del paso con su número. */}
        <div
          className="relative rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:p-7"
          style={{
            background:
              'radial-gradient(120% 80% at 0% 0%, rgba(212,175,55,0.08), transparent 55%), linear-gradient(180deg, #17130C 0%, #0F0C07 100%)',
          }}
        >
        <div className="mb-6 flex items-start gap-3 border-b border-dashed border-[#D4AF37]/15 pb-5">
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-black text-[#1a1408]"
            style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
          >
            {fields.step}
          </span>
          <div>
            <h2
              className="text-xl font-black text-[#F5E6C8] sm:text-2xl"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {currentStep.title}
            </h2>
            <p className="mt-0.5 text-sm text-[#9A7B50]">
              {currentStep.description}
            </p>
          </div>
        </div>

        {fields.step === 1 && (
          <PersonalDataSection
            nombres={fields.nombres}
            setNombres={fields.setNombres}
            apellidos={fields.apellidos}
            setApellidos={fields.setApellidos}
            docType={fields.docType}
            setDocType={fields.setDocType}
            docNum={fields.docNum}
            setDocNum={fields.setDocNum}
            birth={fields.birth}
            setBirth={fields.setBirth}
            phone={fields.phone}
            setPhone={fields.setPhone}
            checkingDocNum={disponibilidad.checkingDocNum}
            errors={{
              nombres: validation.errors.nombres,
              apellidos: validation.errors.apellidos,
              docType: validation.errors.docType,
              docNum: validation.errors.docNum,
              birth: validation.errors.birth,
              phone: validation.errors.phone,
            }}
          />
        )}

        {fields.step === 2 && (
          <LocationSection
            dept={fields.dept}
            setDept={fields.setDept}
            city={fields.city}
            setCity={fields.setCity}
            departamentos={ubicaciones.nombresDepartamentos}
            municipios={ubicaciones.municipiosDelDepartamento}
            ubicacionesCargadas={ubicaciones.ubicaciones.length > 0}
            ubicacionesError={ubicaciones.error}
            deptError={validation.errors.dept}
            cityError={validation.errors.city}
          />
        )}

        {fields.step === 3 && (
          <AccessDataSection
            email={fields.email}
            setEmail={fields.setEmail}
            emailError={validation.errors.email}
            checkingEmail={disponibilidad.checkingEmail}
            pass={fields.pass}
            setPass={fields.setPass}
            passConfirm={fields.passConfirm}
            setPassConfirm={fields.setPassConfirm}
            showPass={fields.showPass}
            setShowPass={fields.setShowPass}
            passStrength={validation.passStrength}
            passConfirmError={validation.errors.passConfirm}
          />
        )}

        {fields.step === 4 && (
          <ConfirmationsSection
            navigate={navigate}
            hrefFor={hrefFor}
            terminos={fields.terminos}
            setTerminos={fields.setTerminos}
            datos={fields.datos}
            setDatos={fields.setDatos}
            edad={fields.edad}
            setEdad={fields.setEdad}
            promo={fields.promo}
            setPromo={fields.setPromo}
            comms={fields.comms}
            setComms={fields.setComms}
            allConfirmed={validation.allConfirmed}
            attemptedNext={fields.attemptedNext}
            step4Valid={validation.step4Valid}
          />
        )}

        <RegistrationActions
          step={fields.step}
          loading={fields.loading}
          submitError={fields.submitError}
          onNext={next}
          onBack={back}
          onSubmit={() => void submit()}
        />
        </div>

        <p className="text-center text-[#3A3020] text-xs mt-6">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('login')}
            className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors underline"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  )
}
