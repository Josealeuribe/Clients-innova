import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import type { SetLoading } from '../login.types'
import { mensajeApiError } from '../utils/loginErrors'


interface Params {
  navigate: (page: Page) => void
  setLoading: SetLoading
}

export function useLoginAccess({ navigate, setLoading }: Params) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ingresar = async () => {
    setError(null)
    setLoading(true)

    try {
      const response = await login(email, pass)

      if (response.tipo === 'staff') {
        navigate(response.staff.rol === 'admin' ? 'admin' : 'cajero')
      } else {
        navigate('dashboard')
      }
    } catch (error) {
      setError(mensajeApiError(error, 'No se pudo iniciar sesión. Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    pass,
    setPass,
    remember,
    setRemember,
    error,
    ingresar,
  }
}
