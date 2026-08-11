import { useState } from 'react'
import type { SetLoading, SetLoginStep } from '../login.types'
import { codigoRecuperacionCompleto, limpiarCodigoRecuperacion, puedePrellenarCorreo } from '../utils/loginValidators'
import { loginService } from '../services/login.service'
import { mensajeApiError } from '../utils/loginErrors'


interface Params {
  setStep: SetLoginStep
  setLoading: SetLoading
}

export function usePasswordRecovery({ setStep, setLoading }: Params) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  // Prueba firmada de haber acertado el código. Vive solo en memoria; si el
  // cliente recarga la página debe iniciar la recuperación otra vez.
  const [token, setToken] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newPassConfirm, setNewPassConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [vigenciaMinutos, setVigenciaMinutos] = useState(15)

  // Se conserva el comportamiento original: reiniciar limpia los datos
  // sensibles del intento, pero no el correo hasta volver completamente al login.
  const reiniciar = () => {
    setCode('')
    setToken('')
    setNewPass('')
    setNewPassConfirm('')
    setError(null)
    setAviso(null)
  }

  const iniciar = (loginEmail: string) => {
    reiniciar()
    if (puedePrellenarCorreo(loginEmail)) setEmail(loginEmail.trim())
    setStep('forgot')
  }

  const volverAlLogin = () => {
    reiniciar()
    setEmail('')
    setStep('login')
  }

  const cambiarCorreo = () => {
    reiniciar()
    setStep('forgot')
  }

  const actualizarCodigo = (value: string) => {
    setCode(limpiarCodigoRecuperacion(value))
  }

  const pedirCodigo = async (reenvio = false) => {
    setError(null)
    setAviso(null)
    setLoading(true)

    try {
      const res = await loginService.solicitarCodigo(email.trim())
      setVigenciaMinutos(res.vigenciaMinutos)
      setCode('')
      setStep('forgot-code')

      if (reenvio) {
        setAviso('Te enviamos un código nuevo. El anterior dejó de servir.')
      }
    } catch (error) {
      setError(mensajeApiError(error, 'No se pudo enviar el código. Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  const verificarCodigo = async () => {
    setError(null)
    setAviso(null)
    setLoading(true)

    try {
      const res = await loginService.verificarCodigo(email.trim(), code.trim())
      setToken(res.token)
      setStep('forgot-new')
    } catch (error) {
      setError(mensajeApiError(error, 'No se pudo verificar el código.'))
    } finally {
      setLoading(false)
    }
  }

  const guardarNuevaPassword = async () => {
    setError(null)
    setLoading(true)

    try {
      await loginService.cambiarPassword(token, newPass, newPassConfirm)
      reiniciar()
      setStep('forgot-done')
    } catch (error) {
      setError(mensajeApiError(error, 'No se pudo cambiar la contraseña.'))
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    code,
    actualizarCodigo,
    codigoCompleto: codigoRecuperacionCompleto(code),
    newPass,
    setNewPass,
    newPassConfirm,
    setNewPassConfirm,
    error,
    aviso,
    vigenciaMinutos,
    iniciar,
    volverAlLogin,
    cambiarCorreo,
    pedirCodigo,
    verificarCodigo,
    guardarNuevaPassword,
  }
}
