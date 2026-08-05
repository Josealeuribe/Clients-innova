import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchMe, loginCliente, registerCliente } from '@/shared/api/client'
import type { BonoInfo, ClienteSafe, LoginResponse, RegisterPayload, RegisterResponse, StaffSafe } from '@/shared/api/types'

const TOKEN_KEY = 'gcc_token'

interface AuthContextValue {
  token: string | null
  cliente: ClienteSafe | null
  bono: BonoInfo | null
  staff: StaffSafe | null
  isAuthenticated: boolean
  loading: boolean
  login: (identifier: string, password: string) => Promise<LoginResponse>
  register: (payload: RegisterPayload) => Promise<RegisterResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [cliente, setCliente] = useState<ClienteSafe | null>(null)
  const [bono, setBono] = useState<BonoInfo | null>(null)
  const [staff, setStaff] = useState<StaffSafe | null>(null)
  const [loading, setLoading] = useState(true)

  // Al montar (o al recargar la página), si hay un token guardado, se
  // valida contra el backend para restaurar la sesión (de cliente o de
  // personal admin/cajero — /me nos dice cuál es con `tipo`).
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe(token)
      .then((me) => {
        if (me.tipo === 'staff') {
          setStaff(me.staff)
          setCliente(null)
          setBono(null)
        } else {
          setCliente(me.cliente)
          setBono(me.bono)
          setStaff(null)
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (identifier: string, password: string) => {
    const response = await loginCliente(identifier, password)
    localStorage.setItem(TOKEN_KEY, response.token)
    setToken(response.token)
    if (response.tipo === 'staff') {
      setStaff(response.staff)
      setCliente(null)
      setBono(null)
    } else {
      setCliente(response.cliente)
      setBono(response.bono)
      setStaff(null)
    }
    return response
  }

  const register = async (payload: RegisterPayload) => {
    const response = await registerCliente(payload)
    localStorage.setItem(TOKEN_KEY, response.token)
    setToken(response.token)
    setCliente(response.cliente)
    setBono(response.bono)
    setStaff(null)
    return response
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setCliente(null)
    setBono(null)
    setStaff(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, cliente, bono, staff, isAuthenticated: !!cliente || !!staff, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
