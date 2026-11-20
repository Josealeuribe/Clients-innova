// Lineas de ayuda para quien siente que el juego dejo de ser entretenimiento.
// Una sola lista para el pie de pagina, Juego Responsable y Preguntas
// Frecuentes: si cambia un numero, cambia en todas.
//
// VERIFICAR ANTES DE PUBLICAR: la linea propia del casino (01-8000-111-444)
// ya estaba en el sitio y se conserva tal cual; confirmar con el area legal que
// sigue activa. La 192 opcion 4 es la linea nacional de salud mental del
// Ministerio de Salud y la 123 la de emergencias.

export interface LineaAyuda {
  nombre: string
  numero: string
  /** Lo que se marca de verdad (href tel:). */
  tel: string
  detalle: string
  /** La que se muestra primero y mas grande. */
  principal?: boolean
}

export const LINEAS_AYUDA: LineaAyuda[] = [
  {
    nombre: 'Línea nacional de salud mental',
    numero: '192 · opción 4',
    tel: '192',
    detalle: 'Ministerio de Salud. Orientación psicológica gratuita y confidencial, también sobre juego compulsivo.',
    principal: true,
  },
  {
    nombre: 'Línea de ayuda Gran Casino Cúcuta',
    numero: '01-8000-111-444',
    tel: '018000111444',
    detalle: 'Orientación sobre juego responsable, autoexclusión y remisión a servicios de apoyo.',
  },
  {
    nombre: 'Emergencias',
    numero: '123',
    tel: '123',
    detalle: 'Si tú o alguien cercano está en riesgo inmediato.',
  },
]

export const LINEA_PRINCIPAL = LINEAS_AYUDA.find((l) => l.principal) ?? LINEAS_AYUDA[0]
