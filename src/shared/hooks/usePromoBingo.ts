import { useEffect, useState } from 'react'
import { fetchPromoBingo } from '@/shared/api/client'
import type { PromoBingo } from '@/shared/api/types'
import { PROMO_BINGO_RESPALDO, respaldoVigente } from '@/shared/data/promoBingo'

// Campaña del Bingo de Ventura Plaza, para las vistas que la anuncian
// (portada, widget de Eventos, ruleta y panel del cliente). Un solo hook para
// todas: la fecha y la hora del evento no pueden decir cosas distintas según la
// pantalla.
//
// ARRANCA CON LOS DATOS DE RESPALDO, NO EN NULL
//
// Antes empezaba en `null` y solo se llenaba con la respuesta de
// GET /api/promocion/bingo. El frontend y la API se despliegan por separado, así
// que mientras la API no traía ese endpoint devolvía 404, el hook se quedaba en
// `null` y la promoción entera desaparecía de todas las vistas sin ningún aviso
// — se veía como si no estuviera implementada.
//
// Ahora se muestra desde el primer render con la copia local y, cuando la API
// responde, esa respuesta MANDA y reemplaza el respaldo. El resultado es que la
// campaña se ve siempre, y se ve con los datos del servidor en cuanto estén.
//
// Devuelve `null` únicamente cuando la campaña está apagada (por el
// interruptor o porque ya pasó la hora del evento), así que quien lo use solo
// tiene que preguntar si hay datos.
export function usePromoBingo(enabled = true) {
  const [promo, setPromo] = useState<PromoBingo | null>(() =>
    enabled && respaldoVigente() ? PROMO_BINGO_RESPALDO : null,
  )
  // Se conserva para poder distinguir "la campaña está apagada" de "no se pudo
  // consultar". No se le muestra al visitante: si la consulta falla, la vista
  // sigue funcionando con el respaldo.
  const [error, setError] = useState<string | null>(null)
  const [desdeApi, setDesdeApi] = useState(false)

  useEffect(() => {
    if (!enabled || desdeApi) return

    let vigente = true
    fetchPromoBingo()
      .then((res) => {
        if (!vigente) return
        // La API es la fuente de verdad: si dice que ya no está activa, se
        // apaga aunque el respaldo siguiera vigente.
        setPromo(res.activa ? res : null)
        setDesdeApi(true)
      })
      .catch((err) => {
        if (!vigente) return
        // Se deja el respaldo puesto a propósito. Este es el caso del endpoint
        // todavía sin desplegar.
        setError(err instanceof Error ? err.message : 'No se pudo consultar la promoción.')
      })

    return () => {
      vigente = false
    }
  }, [enabled, desdeApi])

  return { promo, error, desdeApi }
}
