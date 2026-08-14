import { useCallback, useState } from 'react'

// Estado de React que sobrevive a recargar la página.
//
// POR QUÉ EXISTE
//
// En los paneles hay dos cosas que duele perder al recargar: en qué sección se
// estaba y en qué página del listado. Antes, cualquier F5 devolvía al admin a
// "Vista General" y a la página 1 — y con listas largas eso significa volver a
// buscar a mano dónde se estaba.
//
// POR QUÉ sessionStorage Y NO localStorage
//
// El alcance correcto es "mientras esta pestaña siga abierta". Los equipos de
// caja son compartidos entre turnos: con localStorage, la cajera del turno de
// la noche abriría el panel en la página 7 del historial de la del día, sin
// entender por qué. Al cerrar la pestaña, el rastro se va.
//
// Todos los accesos van envueltos en try/catch: Safari en modo privado lanza al
// tocar sessionStorage, y perder la persistencia es un detalle — quedarse con
// el panel en blanco por eso, no.

function leer<T>(clave: string, inicial: T): T {
  try {
    const guardado = window.sessionStorage.getItem(clave)
    return guardado === null ? inicial : (JSON.parse(guardado) as T)
  } catch {
    return inicial
  }
}

export function useEstadoPersistido<T>(clave: string, inicial: T) {
  const [valor, setValorInterno] = useState<T>(() => leer(clave, inicial))

  const setValor = useCallback(
    (siguiente: T | ((actual: T) => T)) => {
      setValorInterno((actual) => {
        const resuelto = typeof siguiente === 'function' ? (siguiente as (a: T) => T)(actual) : siguiente
        try {
          window.sessionStorage.setItem(clave, JSON.stringify(resuelto))
        } catch {
          // Almacenamiento bloqueado: el estado sigue vivo en memoria y solo se
          // pierde al recargar, que es exactamente el comportamiento de antes.
        }
        return resuelto
      })
    },
    [clave],
  )

  return [valor, setValor] as const
}
