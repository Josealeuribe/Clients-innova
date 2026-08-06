import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

// Borrador del formulario de registro. Existe para que salir a leer los
// términos (o la política de privacidad) y volver no borre lo que el usuario
// ya escribió: al navegar, RegistrationPage se desmonta y su useState se
// pierde, pero este provider vive por encima del cambio de vista.
//
// Se guarda SOLO EN MEMORIA, deliberadamente. El formulario incluye la
// contraseña en texto plano y la promoción se usa desde equipos compartidos
// en sede, así que no debe quedar en sessionStorage ni localStorage: ahí
// sobreviviría a la sesión del cliente. En memoria muere al recargar o
// cerrar la pestaña, que es exactamente lo que queremos.

type Borrador = Record<string, unknown>

interface RegistrationDraftValue {
  leer: <T>(campo: string, porDefecto: T) => T
  guardar: (campo: string, valor: unknown) => void
  limpiar: () => void
}

const RegistrationDraftContext = createContext<RegistrationDraftValue | null>(null)

export function RegistrationDraftProvider({ children }: { children: ReactNode }) {
  // useRef y no useState: escribir en el borrador no debe re-renderizar a
  // toda la app en cada tecla. El re-render lo maneja cada campo con su
  // propio useState local.
  const borrador = useRef<Borrador>({})

  const leer = useCallback(<T,>(campo: string, porDefecto: T): T => {
    return campo in borrador.current ? (borrador.current[campo] as T) : porDefecto
  }, [])

  const guardar = useCallback((campo: string, valor: unknown) => {
    borrador.current[campo] = valor
  }, [])

  const limpiar = useCallback(() => {
    borrador.current = {}
  }, [])

  const value = useMemo(() => ({ leer, guardar, limpiar }), [leer, guardar, limpiar])

  return <RegistrationDraftContext.Provider value={value}>{children}</RegistrationDraftContext.Provider>
}

export function useRegistrationDraft() {
  const ctx = useContext(RegistrationDraftContext)
  if (!ctx) throw new Error('useRegistrationDraft debe usarse dentro de <RegistrationDraftProvider>')
  return ctx
}

// Se comporta igual que useState, pero además respalda el valor en el
// borrador compartido. Permite conservar el formulario cambiando solo la
// línea de declaración de cada campo, sin tocar el JSX.
export function useCampoBorrador<T>(campo: string, inicial: T) {
  const { leer, guardar } = useRegistrationDraft()
  const [valor, setValor] = useState<T>(() => leer(campo, inicial))

  const asignar = useCallback(
    (siguiente: T | ((previo: T) => T)) => {
      setValor((previo) => {
        const resultado = typeof siguiente === 'function' ? (siguiente as (p: T) => T)(previo) : siguiente
        guardar(campo, resultado)
        return resultado
      })
    },
    [campo, guardar],
  )

  return [valor, asignar] as const
}
