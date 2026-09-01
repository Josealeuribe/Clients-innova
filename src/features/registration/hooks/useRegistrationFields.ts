import { useState } from 'react'
import { useCampoBorrador } from '@/shared/context/RegistrationDraftContext'
import type { RegistrationStep } from '../registration.types'

export function useRegistrationFields() {
  const [step, setStep] = useCampoBorrador<RegistrationStep>('step', 1)

  const [attemptedNext, setAttemptedNext] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const [nombres, setNombres] = useCampoBorrador('nombres', '')
  const [apellidos, setApellidos] = useCampoBorrador('apellidos', '')
  const [docType, setDocType] = useCampoBorrador('docType', '')
  const [docNum, setDocNum] = useCampoBorrador('docNum', '')
  const [birth, setBirth] = useCampoBorrador('birth', '')
  const [phone, setPhone] = useCampoBorrador('phone', '')

  const [dept, setDept] = useCampoBorrador('dept', '')
  const [city, setCity] = useCampoBorrador('city', '')

  const [email, setEmail] = useCampoBorrador('email', '')
  const [pass, setPass] = useCampoBorrador('pass', '')
  const [passConfirm, setPassConfirm] = useCampoBorrador('passConfirm', '')

  const [terminos, setTerminos] = useCampoBorrador('terminos', false)
  const [datos, setDatos] = useCampoBorrador('datos', false)
  const [edad, setEdad] = useCampoBorrador('edad', false)
  const [promo, setPromo] = useCampoBorrador('promo', false)
  const [comms, setComms] = useCampoBorrador('comms', false)

  return {
    step,
    setStep,
    attemptedNext,
    setAttemptedNext,
    success,
    setSuccess,
    loading,
    setLoading,
    submitError,
    setSubmitError,
    showPass,
    setShowPass,

    nombres,
    setNombres,
    apellidos,
    setApellidos,
    docType,
    setDocType,
    docNum,
    setDocNum,
    birth,
    setBirth,
    phone,
    setPhone,

    dept,
    setDept,
    city,
    setCity,

    email,
    setEmail,
    pass,
    setPass,
    passConfirm,
    setPassConfirm,

    terminos,
    setTerminos,
    datos,
    setDatos,
    edad,
    setEdad,
    promo,
    setPromo,
    comms,
    setComms,
  }
}
