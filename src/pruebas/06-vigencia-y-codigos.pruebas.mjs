// Vigencia de la promoción y unicidad de los códigos de canje.
//
// Los códigos son secretos de portador: quien lo tenga se lleva el premio. Se
// verifica que nunca se repitan y que no sean adivinables por patrón.

import { api, authHeader, createSuite, registroValido, testEmail, testDocNum } from './_helpers.mjs'

const { assert, finish } = createSuite('06 - Vigencia de premios y unicidad de códigos')

// 31 de agosto 23:59:59 hora de Colombia = 1 de septiembre 04:59:59 UTC.
// Se compara el INSTANTE y no el texto: si se comparara la fecha en UTC, la
// prueba pasaría en un equipo colombiano y fallaría en el servidor (o al
// revés), que es justo el error que se quiere evitar.
const VIGENCIA_ESPERADA_UTC = '2026-09-01T04:59:59.000Z'

function venceBienEnColombia(iso) {
  if (!iso) return false
  return new Date(iso).toISOString() === VIGENCIA_ESPERADA_UTC
}
const CAJERO_CREDS = { identifier: 'cajero@grancasino.com.co', password: 'CajeroCucuta0805' }

async function main() {
  const cajero = await api('/auth/login', { method: 'POST', body: JSON.stringify(CAJERO_CREDS) })
  const cajeroToken = cajero.body.token

  // 1) El giro adicional quedó fuera de la promoción
  const clavesVistas = new Set()
  for (let i = 0; i < 45; i++) {
    const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
    clavesVistas.add(giro.body?.premio?.clave)
  }
  assert(!clavesVistas.has('giro-extra'), 'el giro adicional ya NO sale nunca en la ruleta')
  assert(clavesVistas.size <= 7, `el catálogo quedó en 7 premios (vistos: ${clavesVistas.size})`)

  // 2) Todos los bonos vencen el 31 de agosto
  const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
  const registro = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giro.body.ticket })),
  })
  const bono = registro.body.bono
  assert(!!bono?.vigenciaHasta, 'el bono trae fecha de vencimiento')
  assert(
    venceBienEnColombia(bono.vigenciaHasta),
    `el bono vence el 31-ago 11:59:59 p.m. hora Colombia (recibido: ${bono?.vigenciaHasta})`,
  )

  // La vigencia sobrevive a recargar la sesión y la ve también el cajero.
  const me = await api('/auth/me', { headers: authHeader(registro.body.token) })
  assert(venceBienEnColombia(me.body?.bono?.vigenciaHasta), '/auth/me expone la misma vigencia')

  const preview = await api(`/cajero/codigo/${bono.codigo}`, { headers: authHeader(cajeroToken) })
  assert(venceBienEnColombia(preview.body?.vigenciaHasta), 'el cajero ve la vigencia del bono')

  // La fecha mostrada en Colombia debe leerse "31 de agosto", no "1 de sep".
  const enBogota = new Date(preview.body.vigenciaHasta).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric',
  })
  assert(enBogota === '31/08/2026', `en hora de Colombia se lee como 31/08/2026 (leído: ${enBogota})`)
  assert(preview.body?.vencido === false, 'un bono dentro de la vigencia no se marca como vencido')

  // 3) Unicidad de códigos: se generan muchos y ninguno se repite. Esto es lo
  //    que impide que dos clientes tengan el mismo código y que alguien pueda
  //    presentarse con el de otro.
  const CANTIDAD = 40
  const codigos = new Set()
  let formatoOk = true
  for (let i = 0; i < CANTIDAD; i++) {
    const g = await api('/ruleta/girar-anonimo', { method: 'POST' })
    const r = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: g.body.ticket })),
    })
    const codigo = r.body?.bono?.codigo
    if (!/^GCC-\d{4}-[0-9A-F]{6}$/.test(codigo || '')) formatoOk = false
    codigos.add(codigo)
  }
  assert(formatoOk, 'todos los códigos respetan el formato GCC-AAAA-XXXXXX')
  assert(codigos.size === CANTIDAD, `los ${CANTIDAD} códigos generados son distintos (únicos: ${codigos.size})`)

  // 4) El espacio de códigos es lo bastante grande: con 6 caracteres hex hay
  //    16.7M combinaciones. Si los códigos vinieran de un generador pobre se
  //    verían prefijos repetidos; se comprueba que la dispersión sea real.
  const sufijos = [...codigos].map((c) => c.split('-')[2])
  const primerCaracter = new Set(sufijos.map((s) => s[0]))
  assert(primerCaracter.size >= 6, `los códigos se dispersan por el espacio (primeros dígitos distintos: ${primerCaracter.size})`)

  // 5) Ningún bono duplicado en toda la base: dos clientes nunca comparten
  //    código, que es la garantía real contra el fraude.
  const historial = await api('/cajero/historial', { headers: authHeader(cajeroToken) })
  const codigosHistorial = historial.body.canjes.map((c) => c.codigo)
  assert(
    new Set(codigosHistorial).size === codigosHistorial.length,
    'no hay códigos repetidos entre todos los bonos ya canjeados',
  )

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
