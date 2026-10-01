import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

// El premio que el visitante acaba de ganar y todavía no ha reclamado.
//
// Existe por el mismo motivo que RegistrationDraftContext: al navegar, la
// vista se desmonta y su useState se pierde. Aquí lo que se perdía era el
// premio — alguien ganaba, abría los términos para leerlos antes de
// registrarse, y al volver la ruleta estaba en blanco, sin modal y sin forma
// de reclamar. El ticket seguía vivo 30 minutos en el servidor, pero el
// navegador ya no lo tenía.
//
// Se guarda SOLO EN MEMORIA, igual que el borrador del registro: el ticket es
// una credencial al portador (quien lo tenga reclama ese premio) y la
// promoción se usa desde equipos compartidos en sede. En sessionStorage
// sobreviviría a la sesión del visitante; en memoria muere al recargar o
// cerrar la pestaña, que es lo que queremos.
//
// Recargar la página, por tanto, SÍ pierde el premio. Es el mismo
// comportamiento que ya tenía y no empeora nada: el premio vivía en useState,
// que tampoco sobrevive a una recarga.

export interface PremioPendiente {
  /** Índice dentro de PRIZES (src/shared/data/prizes.ts). */
  segmentIndex: number
  /** Ticket firmado por el servidor; es lo que convierte el premio en bono. */
  ticket: string
}

interface PremioPendienteValue {
  premioPendiente: PremioPendiente | null
  recordar: (premio: PremioPendiente) => void
  olvidar: () => void
}

const PremioPendienteContext = createContext<PremioPendienteValue | null>(null)

export function PremioPendienteProvider({ children }: { children: ReactNode }) {
  // useState y no useRef, al contrario que el borrador del registro: aquí el
  // cambio SÍ tiene que repintar (el botón de "volver" de los términos cambia
  // de texto según haya premio pendiente o no), y ocurre dos o tres veces por
  // visita, no en cada tecla.
  const [premioPendiente, setPremioPendiente] = useState<PremioPendiente | null>(null)

  const value = useMemo(
    () => ({
      premioPendiente,
      recordar: (premio: PremioPendiente) => setPremioPendiente(premio),
      olvidar: () => setPremioPendiente(null),
    }),
    [premioPendiente],
  )

  return <PremioPendienteContext.Provider value={value}>{children}</PremioPendienteContext.Provider>
}

export function usePremioPendiente() {
  const ctx = useContext(PremioPendienteContext)
  if (!ctx) throw new Error('usePremioPendiente debe usarse dentro de <PremioPendienteProvider>')
  return ctx
}
