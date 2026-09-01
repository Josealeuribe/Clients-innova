import { useEffect } from 'react'
import { ApiError } from '@/shared/api/client'
import { useAuth } from '@/shared/context/AuthContext'
import { useRegistrationDraft } from '@/shared/context/RegistrationDraftContext'
import type { Page } from '@/shared/types/navigation'

interface Props {
  navigate: (page: Page) => void
  ticket: string | null
  isStepValid: boolean

  nombres: string
  apellidos: string
  docType: string
  docNum: string
  birth: string
  phone: string
  dept: string
  city: string
  email: string
  pass: string
  passConfirm: string
  terminos: boolean
  datos: boolean
  edad: boolean
  promo: boolean
  comms: boolean

  success: boolean
  setSuccess: (value: boolean) => void
  loading: boolean
  setLoading: (value: boolean) => void
  setSubmitError: (value: string | null) => void
  setAttemptedNext: (value: boolean) => void
}

export function useRegistrationSubmit(props: Props) {
  const { register } = useAuth()
  const { limpiar: limpiarBorrador } = useRegistrationDraft()

  useEffect(() => {
    if (!props.success) return

    const timeout = setTimeout(() => {
      props.navigate('dashboard')
    }, 3500)

    return () => clearTimeout(timeout)
  }, [props.success, props.navigate])

  const submit = async () => {
    if (!props.isStepValid) {
      props.setAttemptedNext(true)
      return
    }

    props.setSubmitError(null)
    props.setLoading(true)

    try {
      await register({
        nombres: props.nombres,
        apellidos: props.apellidos,
        docType: props.docType,
        docNum: props.docNum,
        birth: props.birth,
        phone: props.phone,
        dept: props.dept,
        city: props.city,
        email: props.email,
        pass: props.pass,
        passConfirm: props.passConfirm,
        terminos: props.terminos,
        datos: props.datos,
        edad: props.edad,
        promo: props.promo,
        comms: props.comms,
        ticket: props.ticket,
      })

      limpiarBorrador()
      props.setSuccess(true)
    } catch (error) {
      props.setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo crear tu cuenta. Intenta de nuevo.',
      )
    } finally {
      props.setLoading(false)
    }
  }

  return {
    submit,
  }
}
