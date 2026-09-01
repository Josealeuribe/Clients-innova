import { useEffect, useState } from 'react'
import { registrationService } from '../services/registration.service'

interface Props {
  docNum: string
  docType: string
  docNumFormatError: string
  email: string
  emailFormatError: string
}

export function useDisponibilidadRegistro({
  docNum,
  docType,
  docNumFormatError,
  email,
  emailFormatError,
}: Props) {
  const [docNumDisponible, setDocNumDisponible] = useState<boolean | null>(null)
  const [emailDisponible, setEmailDisponible] = useState<boolean | null>(null)
  const [checkingDocNum, setCheckingDocNum] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  useEffect(() => {
    setDocNumDisponible(null)

    if (!docNum.trim() || docNumFormatError) return

    setCheckingDocNum(true)

    const timeout = setTimeout(() => {
      registrationService
        .checkDocumento(docNum.trim())
        .then((res) => setDocNumDisponible(res.docNumDisponible ?? null))
        .catch(() => setDocNumDisponible(null))
        .finally(() => setCheckingDocNum(false))
    }, 500)

    return () => {
      clearTimeout(timeout)
      setCheckingDocNum(false)
    }
  }, [docNum, docType, docNumFormatError])

  useEffect(() => {
    setEmailDisponible(null)

    if (!email.trim() || emailFormatError) return

    setCheckingEmail(true)

    const timeout = setTimeout(() => {
      registrationService
        .checkEmail(email.trim())
        .then((res) => setEmailDisponible(res.emailDisponible ?? null))
        .catch(() => setEmailDisponible(null))
        .finally(() => setCheckingEmail(false))
    }, 500)

    return () => {
      clearTimeout(timeout)
      setCheckingEmail(false)
    }
  }, [email, emailFormatError])

  return {
    docNumDisponible,
    emailDisponible,
    checkingDocNum,
    checkingEmail,
  }
}
