import { useEffect } from 'react'

// Congela el scroll de la página mientras un modal está abierto.
//
// POR QUÉ HACE FALTA
//
// Sin esto, la rueda del ratón sigue moviendo la página de atrás: el modal se
// queda quieto y el contenido se desliza detrás, que es exactamente lo que se
// ve mal. En celular es peor, porque el gesto de desplazar dentro del modal se
// contagia al fondo en cuanto el modal llega a su límite.
//
// POR QUÉ NO BASTA CON `overflow: hidden` EN EL BODY
//
// En esta aplicación el elemento que scrollea es el body. Al ponerle
// `overflow: hidden` su alto deja de desbordar, el navegador ya no tiene a
// dónde desplazarse y RESETEA la posición a 0: abrir el modal saltaba la página
// al inicio, y al cerrarlo el visitante aparecía arriba en vez de donde estaba.
// Medido: se iba de scrollY 400 a 0.
//
// La técnica que sí conserva la posición es fijar el body y subirlo tantos
// pixeles como llevaba desplazados. Visualmente no se mueve nada, el fondo
// queda inmóvil de verdad (también en iOS, donde `overflow: hidden` no frena el
// gesto táctil) y al cerrar se restaura el desplazamiento exacto.
export function useBloquearScroll(activo: boolean) {
  useEffect(() => {
    if (!activo) return

    const { body, documentElement } = document
    const desplazamiento = window.scrollY || documentElement.scrollTop || 0

    // Se guarda lo que había para restaurarlo tal cual, en vez de asumir que
    // estaba vacío: si algún día dos modales se solapan, el segundo en cerrarse
    // no debe dejar el body con estilos que no le corresponden.
    const anterior = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }

    // Al fijar el body desaparece la barra de scroll y la página salta unos
    // pixeles a la derecha. Se rellena el hueco para que nada se mueva.
    const anchoBarra = window.innerWidth - documentElement.clientWidth

    body.style.position = 'fixed'
    body.style.top = `-${desplazamiento}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    if (anchoBarra > 0) body.style.paddingRight = `${anchoBarra}px`

    return () => {
      body.style.position = anterior.position
      body.style.top = anterior.top
      body.style.width = anterior.width
      body.style.overflow = anterior.overflow
      body.style.paddingRight = anterior.paddingRight
      // Devolver al visitante exactamente donde estaba. Sin esto quedaría
      // arriba, que es el problema que este hook viene a evitar.
      window.scrollTo(0, desplazamiento)
    }
  }, [activo])
}
