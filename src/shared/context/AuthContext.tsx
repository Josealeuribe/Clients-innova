import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { cerrarSesionStaff, fetchMe, loginCliente, registerCliente, registrarActividadStaff } from '@/shared/api/client'
import type { BonoInfo, ClienteSafe, LoginResponse, RegisterPayload, RegisterResponse, StaffSafe } from '@/shared/api/types'

const TOKEN_KEY = 'gcc_token'

// Cada cuánto avisa el panel de que sigue abierto. El servidor considera
// presente a quien dio señales en los últimos 180 s, así que un minuto deja
// margen para dos latidos perdidos por una red mala antes de marcar a nadie
// como ausente por error.
const LATIDO_MS = 60_000

interface AuthContextValue {
  token: string | null
  cliente: ClienteSafe | null
  bono: BonoInfo | null
  staff: StaffSafe | null
  isAuthenticated: boolean
  // El cliente ya tiene un bono (pendiente o canjeado) y por tanto no puede
  // volver a girar. `bono` no sirve para esto: llega en null cuando ya se
  // canjeó, igual que cuando nunca participó.
  yaParticipo: boolean
  bonoCanjeado: boolean
  loading: boolean
  login: (identifier: string, password: string) => Promise<LoginResponse>
  register: (payload: RegisterPayload) => Promise<RegisterResponse>
  logout: () => void
  // Baja el aviso de "debes cambiar la contraseña" sin volver a pedir /me: el
  // backend ya apagó el flag al guardar el cambio, y recargar la sesión entera
  // solo para eso deja el panel en blanco un instante.
  marcarPasswordCambiada: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [cliente, setCliente] = useState<ClienteSafe | null>(null)
  const [bono, setBono] = useState<BonoInfo | null>(null)
  const [staff, setStaff] = useState<StaffSafe | null>(null)
  const [participacion, setParticipacion] = useState({ yaParticipo: false, bonoCanjeado: false })
  const [loading, setLoading] = useState(true)

  const SIN_PARTICIPACION = { yaParticipo: false, bonoCanjeado: false }

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
          setParticipacion(SIN_PARTICIPACION)
        } else {
          setCliente(me.cliente)
          setBono(me.bono)
          setStaff(null)
          setParticipacion({ yaParticipo: me.yaParticipo, bonoCanjeado: me.bonoCanjeado })
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  // Latido de presencia, SOLO para el personal: es lo que hace que el módulo de
  // Personal pueda decir "Activo" de alguien que tiene el panel abierto sin
  // estar tocándolo. Los clientes no tienen indicador de presencia en ninguna
  // parte, así que no se les gasta una petición por minuto.
  //
  // Se depende de staff?.id y no del objeto `staff`: ese objeto se reemplaza al
  // cambiar la contraseña (marcarPasswordCambiada) y eso reiniciaría el
  // temporizador sin motivo.
  const staffId = staff?.id
  useEffect(() => {
    if (!token || !staffId) return

    const latir = () => {
      // Mejor esfuerzo: si el latido falla no hay nada que decirle a nadie. Lo
      // único que pasa es que la cuenta aparecerá fuera de línea en el panel del
      // admin, que es la verdad más segura cuando no hay señal.
      void registrarActividadStaff(token).catch(() => {})
    }

    // Uno de entrada: sin esto el estado tardaría hasta un minuto en encenderse
    // después de iniciar sesión.
    latir()
    const temporizador = window.setInterval(latir, LATIDO_MS)

    // El navegador congela los temporizadores de las pestañas ocultas, así que
    // una pestaña de fondo deja de latir y la cuenta cae a fuera de línea — es
    // lo correcto, con la pestaña escondida no se está en el aplicativo. Al
    // volver a ella se late de inmediato para no dejarla ausente un minuto más.
    const alVolver = () => {
      if (document.visibilityState === 'visible') latir()
    }
    document.addEventListener('visibilitychange', alVolver)

    return () => {
      window.clearInterval(temporizador)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [token, staffId])

  const login = async (identifier: string, password: string) => {
    const response = await loginCliente(identifier, password)
    localStorage.setItem(TOKEN_KEY, response.token)
    setToken(response.token)
    if (response.tipo === 'staff') {
      setStaff(response.staff)
      setCliente(null)
      setBono(null)
      setParticipacion(SIN_PARTICIPACION)
    } else {
      setCliente(response.cliente)
      setBono(response.bono)
      setStaff(null)
      setParticipacion({ yaParticipo: response.yaParticipo, bonoCanjeado: response.bonoCanjeado })
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
    setParticipacion({ yaParticipo: response.yaParticipo, bonoCanjeado: response.bonoCanjeado })
    return response
  }

  const marcarPasswordCambiada = () => {
    setStaff((actual) => (actual ? { ...actual, debeCambiarPassword: false } : actual))
  }

  const logout = () => {
    // Se avisa al servidor para que la cuenta pase a "Fuera de línea" en el
    // panel del admin ahora mismo, en vez de quedar como presente los tres
    // minutos que dura la ventana.
    //
    // No se espera la respuesta: cerrar sesión debe ser instantáneo para quien
    // lo pidió, y si la petición se pierde el único costo es que el indicador
    // tarde esos minutos en caer solo.
    if (token && staff) {
      void cerrarSesionStaff(token).catch(() => {})
    }

    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setCliente(null)
    setBono(null)
    setStaff(null)
    setParticipacion(SIN_PARTICIPACION)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        cliente,
        bono,
        staff,
        isAuthenticated: !!cliente || !!staff,
        yaParticipo: participacion.yaParticipo,
        bonoCanjeado: participacion.bonoCanjeado,
        loading,
        login,
        register,
        logout,
        marcarPasswordCambiada,
      }}
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
