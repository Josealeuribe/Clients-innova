// EXPORTAR UNA TABLA A EXCEL (.xlsx) SIN DEPENDENCIAS
//
// POR QUÉ NO SE INSTALA UNA LIBRERÍA
//
// Un .xlsx es un ZIP con cuatro XML adentro. Escribirlos a mano cabe en este
// archivo y no arrastra ~1 MB de JavaScript al bundle de un panel que se abre
// desde el navegador de caja, muchas veces con la red del casino. La parte
// delicada — el ZIP y su CRC — está abajo y no cambia nunca; lo que sí cambia,
// las columnas, vive en quien llama.
//
// POR QUÉ NO UN CSV
//
// Excel abre un CSV interpretando cada columna a su manera: un documento de
// cédula "0098765432" se convierte en número y pierde el cero de adelante, y
// una fecha "05/09/2026" se lee como mes 5 en un equipo en inglés. Aquí cada
// celda viaja con su tipo declarado, así que el número de documento llega como
// texto y la fecha como fecha de verdad — ordenable y filtrable en la hoja.

/**
 * Qué es cada columna para Excel. Decide el tipo de celda y el formato:
 * `texto` no lo toca (documentos y teléfonos conservan ceros a la izquierda),
 * `fecha` y `fechaHora` quedan ordenables, `dinero` sumable.
 */
export type TipoColumna = 'texto' | 'numero' | 'fecha' | 'fechaHora' | 'dinero'

export interface ColumnaExcel<T> {
  encabezado: string
  /** Por defecto `texto`. */
  tipo?: TipoColumna
  /** Ancho en caracteres. Por defecto se estima con el largo del encabezado. */
  ancho?: number
  /**
   * Valor crudo de la celda. Devolver `null` deja la celda vacía, que no es lo
   * mismo que un "—": una celda vacía no estorba al filtrar ni al sumar.
   */
  valor: (fila: T) => string | number | Date | null | undefined
}

// --- XML ---

// Excel rechaza el archivo entero si un solo carácter de control se cuela en el
// XML. Pasa de verdad: un nombre pegado desde otro sistema puede traer un \x01
// invisible. Se quitan aquí y no en cada columna.
function escaparXml(valor: string) {
  return valor
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function letraColumna(indice: number) {
  let numero = indice + 1
  let letra = ''
  while (numero > 0) {
    const resto = (numero - 1) % 26
    letra = String.fromCharCode(65 + resto) + letra
    numero = Math.floor((numero - 1) / 26)
  }
  return letra
}

// --- Fechas ---

// Excel cuenta días desde el 30/12/1899 (el 25569 es el 01/01/1970, y el día
// perdido es el bisiesto de 1900 que Excel cree que existió).
const DIAS_HASTA_EPOCH = 25569
const MS_POR_DIA = 86_400_000

// Colombia es UTC-5 todo el año, sin horario de verano. El corrimiento va fijo
// y no se deja al reloj del equipo: en los computadores de caja la zona horaria
// está mal configurada más seguido de lo que uno quisiera, y un registro hecho
// a las 8 p.m. no puede aparecer en la hoja con la fecha del día siguiente.
const OFFSET_COLOMBIA_MS = 5 * 60 * 60 * 1000

function serialExcel(valor: string | number | Date, soloDia: boolean) {
  const ms = valor instanceof Date ? valor.getTime() : new Date(valor).getTime()
  if (!Number.isFinite(ms)) return null

  const serial = (ms - OFFSET_COLOMBIA_MS) / MS_POR_DIA + DIAS_HASTA_EPOCH
  return soloDia ? Math.floor(serial) : serial
}

// --- Estilos ---

// Los índices de `cellXfs` que usan las celdas. Van en el mismo orden que el
// XML de abajo; si se agrega un estilo, se agrega al final de los dos lados.
const ESTILO = { normal: 0, encabezado: 1, fecha: 2, fechaHora: 3, dinero: 4 } as const

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="3"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy\\ hh:mm"/><numFmt numFmtId="166" formatCode="&quot;$&quot;\\ #,##0"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFF5E6C8"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1A1206"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

// --- Celdas ---

function celdaTexto(ref: string, texto: string, estilo: number) {
  return `<c r="${ref}" s="${estilo}" t="inlineStr"><is><t xml:space="preserve">${escaparXml(texto)}</t></is></c>`
}

function celdaNumero(ref: string, numero: number, estilo: number) {
  return `<c r="${ref}" s="${estilo}"><v>${numero}</v></c>`
}

function celda<T>(ref: string, columna: ColumnaExcel<T>, fila: T) {
  const valor = columna.valor(fila)
  if (valor == null || valor === '') return ''

  switch (columna.tipo ?? 'texto') {
    case 'fecha':
    case 'fechaHora': {
      const soloDia = columna.tipo === 'fecha'
      const serial = serialExcel(valor as string | number | Date, soloDia)
      // Una fecha ilegible se escribe tal cual en vez de desaparecer: si la API
      // manda algo raro, que se vea en la hoja y no que la celda salga vacía.
      if (serial == null) return celdaTexto(ref, String(valor), ESTILO.normal)
      return celdaNumero(ref, serial, soloDia ? ESTILO.fecha : ESTILO.fechaHora)
    }
    case 'numero':
    case 'dinero': {
      const numero = typeof valor === 'number' ? valor : Number(valor)
      if (!Number.isFinite(numero)) return celdaTexto(ref, String(valor), ESTILO.normal)
      return celdaNumero(ref, numero, columna.tipo === 'dinero' ? ESTILO.dinero : ESTILO.normal)
    }
    default:
      return celdaTexto(ref, String(valor), ESTILO.normal)
  }
}

function hojaXml<T>(columnas: ColumnaExcel<T>[], filas: T[]) {
  const ultima = letraColumna(columnas.length - 1)
  const totalFilas = filas.length + 1

  const cols = columnas
    .map((c, i) => {
      const ancho = c.ancho ?? Math.max(12, Math.min(40, c.encabezado.length + 4))
      return `<col min="${i + 1}" max="${i + 1}" width="${ancho}" customWidth="1"/>`
    })
    .join('')

  const encabezado = columnas
    .map((c, i) => celdaTexto(`${letraColumna(i)}1`, c.encabezado, ESTILO.encabezado))
    .join('')

  const cuerpo = filas
    .map((fila, indice) => {
      const numero = indice + 2
      const celdas = columnas.map((c, i) => celda(`${letraColumna(i)}${numero}`, c, fila)).join('')
      return `<row r="${numero}">${celdas}</row>`
    })
    .join('')

  // La fila 1 va congelada y con autofiltro: la hoja se abre en el estado en
  // que se va a usar — buscar una cédula entre miles de filas — sin que nadie
  // tenga que activarlo a mano.
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:${ultima}${totalFilas}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${cols}</cols>
<sheetData><row r="1" ht="20" customHeight="1">${encabezado}</row>${cuerpo}</sheetData>
<autoFilter ref="A1:${ultima}${totalFilas}"/>
</worksheet>`
}

// --- ZIP ---

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let valor = i
    for (let bit = 0; bit < 8; bit++) valor = valor & 1 ? 0xedb88320 ^ (valor >>> 1) : valor >>> 1
    tabla[i] = valor >>> 0
  }
  return tabla
})()

function crc32(datos: Uint8Array) {
  let valor = 0xffffffff
  for (let i = 0; i < datos.length; i++) valor = TABLA_CRC[(valor ^ datos[i]) & 0xff] ^ (valor >>> 8)
  return (valor ^ 0xffffffff) >>> 0
}

// ZIP sin compresión (método 0). Comprimir exigiría un deflate propio o
// CompressionStream, que no está en todos los navegadores de los equipos de
// caja; el archivo pesa más, pero se abre en cualquiera.
function crearZip(archivos: { nombre: string; contenido: string }[]) {
  const codificador = new TextEncoder()
  // El parámetro de `Uint8Array` va explícito: sin él TypeScript infiere
  // `ArrayBufferLike`, que incluye `SharedArrayBuffer` y no sirve como parte de
  // un Blob.
  const locales: Uint8Array<ArrayBuffer>[] = []
  const centrales: Uint8Array<ArrayBuffer>[] = []
  let offset = 0
  let tamanoCentral = 0

  for (const archivo of archivos) {
    const nombre = codificador.encode(archivo.nombre)
    const datos = codificador.encode(archivo.contenido)
    const crc = crc32(datos)

    const local = new Uint8Array(30 + nombre.length)
    const l = new DataView(local.buffer)
    l.setUint32(0, 0x04034b50, true)
    l.setUint16(4, 20, true)
    l.setUint16(6, 0x0800, true) // nombres en UTF-8
    l.setUint16(8, 0, true) // sin compresión
    l.setUint16(10, 0, true) // hora
    l.setUint16(12, 0x21, true) // fecha: 01/01/1980, la mínima que admite el formato
    l.setUint32(14, crc, true)
    l.setUint32(18, datos.length, true)
    l.setUint32(22, datos.length, true)
    l.setUint16(26, nombre.length, true)
    l.setUint16(28, 0, true)
    local.set(nombre, 30)

    const central = new Uint8Array(46 + nombre.length)
    const c = new DataView(central.buffer)
    c.setUint32(0, 0x02014b50, true)
    c.setUint16(4, 20, true)
    c.setUint16(6, 20, true)
    c.setUint16(8, 0x0800, true)
    c.setUint16(10, 0, true)
    c.setUint16(12, 0, true)
    c.setUint16(14, 0x21, true)
    c.setUint32(16, crc, true)
    c.setUint32(20, datos.length, true)
    c.setUint32(24, datos.length, true)
    c.setUint16(28, nombre.length, true)
    c.setUint32(42, offset, true)
    central.set(nombre, 46)

    locales.push(local, datos)
    centrales.push(central)
    offset += local.length + datos.length
    tamanoCentral += central.length
  }

  const fin = new Uint8Array(22)
  const f = new DataView(fin.buffer)
  f.setUint32(0, 0x06054b50, true)
  f.setUint16(8, archivos.length, true)
  f.setUint16(10, archivos.length, true)
  f.setUint32(12, tamanoCentral, true)
  f.setUint32(16, offset, true)

  return new Blob([...locales, ...centrales, fin], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

// --- API ---

export interface OpcionesExcel<T> {
  /** Sin extensión: se le agrega `.xlsx`. */
  nombreArchivo: string
  /** Nombre de la pestaña dentro del libro. */
  hoja: string
  columnas: ColumnaExcel<T>[]
  filas: T[]
}

/** Arma el libro y lo devuelve como Blob, sin descargarlo. */
export function construirExcel<T>(opciones: Omit<OpcionesExcel<T>, 'nombreArchivo'>) {
  const { hoja, columnas, filas } = opciones

  // Excel no admite : \ / ? * [ ] en el nombre de la pestaña, ni más de 31
  // caracteres. Se recorta aquí para que nadie tenga que recordarlo al llamar.
  const nombreHoja = escaparXml(hoja.replace(/[:\\/?*[\]]/g, '-').slice(0, 31) || 'Hoja1')

  return crearZip([
    {
      nombre: '[Content_Types].xml',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      nombre: '_rels/.rels',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      nombre: 'xl/workbook.xml',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${nombreHoja}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    },
    {
      nombre: 'xl/_rels/workbook.xml.rels',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { nombre: 'xl/styles.xml', contenido: STYLES_XML },
    { nombre: 'xl/worksheets/sheet1.xml', contenido: hojaXml(columnas, filas) },
  ])
}

/** Arma el libro y lo baja por el navegador. */
export function descargarExcel<T>({ nombreArchivo, hoja, columnas, filas }: OpcionesExcel<T>) {
  const blob = construirExcel({ hoja, columnas, filas })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${nombreArchivo}.xlsx`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  // Firefox cancela la descarga si el objeto se libera en el mismo tick.
  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

/** `2026-09-14`, en hora de Colombia — para pegar en el nombre del archivo. */
export function fechaParaNombre(fecha = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Bogota',
  }).format(fecha)
}
