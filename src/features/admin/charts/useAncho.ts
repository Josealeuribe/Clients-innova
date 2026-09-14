import { useEffect, useRef, useState } from 'react'

// Ancho real del contenedor, medido.
//
// POR QUÉ MEDIR Y NO ESCALAR EL SVG
//
// Un `viewBox` fijo estirado al 100% escala TODO: una línea de 2px se vuelve de
// 3.4px en un monitor ancho y de 1.1px en el sidebar, y el texto de los ejes
// cambia de tamaño con el ancho de la ventana. Midiendo, el SVG se dibuja en
// píxeles reales y los grosores y las letras son los que se especificaron.
export function useAncho<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [ancho, setAncho] = useState(0)

  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return

    const observador = new ResizeObserver((entradas) => {
      // `contentRect` ya descuenta el padding, que es justo el espacio en el
      // que se puede dibujar.
      setAncho(entradas[0].contentRect.width)
    })
    observador.observe(nodo)
    setAncho(nodo.getBoundingClientRect().width)

    return () => observador.disconnect()
  }, [])

  return { ref, ancho }
}
