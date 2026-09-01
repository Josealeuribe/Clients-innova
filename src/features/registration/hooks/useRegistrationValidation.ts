import { useMemo } from 'react'
import type { RegistrationStep } from '../registration.types'
import {
  getBirthError,
  getDocumentFormatError,
  getEmailFormatError,
  getPasswordConfirmError,
  getPasswordStrength,
  getPhoneError,
  isPasswordValid,
} from '../utils/registrationValidators'

interface Props {
  step: RegistrationStep
  attemptedNext: boolean

  nombres: string
  apellidos: string
  docType: string
  docNum: string
  birth: string
  phone: string
  docNumDisponible: boolean | null

  dept: string
  city: string

  email: string
  pass: string
  passConfirm: string
  emailDisponible: boolean | null

  terminos: boolean
  datos: boolean
  edad: boolean
  promo: boolean
  comms: boolean
}

export function useRegistrationValidation(props: Props) {
  return useMemo(() => {
    const docNumFormatError = getDocumentFormatError(props.docNum, props.docType)
    const docNumError =
      docNumFormatError ||
      (props.docNumDisponible === false
        ? 'Ya existe una cuenta registrada con este documento.'
        : '')

    const birthError = getBirthError(props.birth)
    const phoneError = getPhoneError(props.phone)

    const emailFormatError = getEmailFormatError(props.email)
    const emailError =
      emailFormatError ||
      (props.emailDisponible === false
        ? 'Ya existe una cuenta registrada con este correo.'
        : '')

    const passStrength = getPasswordStrength(props.pass)
    const passValid = isPasswordValid(props.pass)
    const passConfirmError = getPasswordConfirmError(props.pass, props.passConfirm)

    const errors = {
      nombres:
        props.attemptedNext && !props.nombres.trim()
          ? 'Este campo es obligatorio.'
          : '',
      apellidos:
        props.attemptedNext && !props.apellidos.trim()
          ? 'Este campo es obligatorio.'
          : '',
      docType:
        props.attemptedNext && !props.docType
          ? 'Selecciona un tipo de documento.'
          : '',
      docNum:
        docNumError ||
        (props.attemptedNext && !props.docNum.trim()
          ? 'Este campo es obligatorio.'
          : ''),
      birth:
        birthError ||
        (props.attemptedNext && !props.birth
          ? 'Este campo es obligatorio.'
          : ''),
      phone:
        phoneError ||
        (props.attemptedNext && !props.phone.trim()
          ? 'Este campo es obligatorio.'
          : ''),
      dept:
        props.attemptedNext && !props.dept
          ? 'Selecciona un departamento.'
          : '',
      city:
        props.attemptedNext && !props.city
          ? 'Selecciona una ciudad.'
          : '',
      email:
        emailError ||
        (props.attemptedNext && !props.email.trim()
          ? 'Este campo es obligatorio.'
          : ''),
      passConfirm: passConfirmError,
    }

    const step1Valid =
      !!props.nombres.trim() &&
      !!props.apellidos.trim() &&
      !!props.docType &&
      !!props.docNum.trim() &&
      !docNumError &&
      props.docNumDisponible !== false &&
      !!props.birth &&
      !birthError &&
      !!props.phone.trim() &&
      !phoneError

    const step2Valid = !!props.dept && !!props.city

    const step3Valid =
      !!props.email.trim() &&
      !emailError &&
      props.emailDisponible !== false &&
      passValid &&
      props.pass === props.passConfirm

    const step4Valid =
      props.terminos &&
      props.datos &&
      props.edad &&
      props.promo

    const isStepValid =
      props.step === 1
        ? step1Valid
        : props.step === 2
          ? step2Valid
          : props.step === 3
            ? step3Valid
            : step4Valid

    return {
      docNumFormatError,
      emailFormatError,
      passStrength,
      passValid,
      errors,
      step1Valid,
      step2Valid,
      step3Valid,
      step4Valid,
      isStepValid,
      allConfirmed:
        props.terminos &&
        props.datos &&
        props.edad &&
        props.promo &&
        props.comms,
    }
  }, [props])
}
