// Límite de giros por visitante y catálogo de ubicaciones en base.
//
// El límite es lo que impide recargar la página hasta sacar el premio
// deseado. El conteo lo lleva el SERVIDOR contra una cookie httpOnly, así que
// se prueba manteniendo la cookie entre peticiones — exactamente lo que hace
// un navegador al recargar.

import { BASE, createSuite, registroValido, testEmail, testDocNum } from './_helpers.mjs'

const { assert, finish } = createSuite('07 - Límite de giros y ubicaciones en base')

const GIROS_ESPERADOS = 3

// Cliente HTTP que conserva las cookies, como haría un navegador. `fetch` de
// Node no las guarda solo.
function crearNavegador() {
  let cookie = null
  return async function pedir(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(cookie ? { Cookie: cookie } : {}),
        ...(options.headers || {}),
      },
    })
    const recibida = res.headers.get('set-cookie')
    if (recibida) cookie = recibida.split(';')[0]
    return { status: res.status, body: await res.json().catch(() => null), cookie }
  }
}

async function main() {
  // 1) Ubicaciones: el catálogo sale de la base, no de un archivo del front
  const ubic = await fetch(`${BASE}/ubicaciones`).then((r) => r.json())
  assert(Array.isArray(ubic.departamentos), 'GET /ubicaciones devuelve la lista de departamentos')
  assert(ubic.departamentos.length >= 10, `hay al menos 10 departamentos (${ubic.departamentos.length})`)

  const nds = ubic.departamentos.find((d) => d.nombre === 'Norte de Santander')
  assert(!!nds, 'Norte de Santander está en el catálogo')
  assert(nds.municipios.length === 40, `Norte de Santander tiene sus 40 municipios (${nds?.municipios.length})`)
  assert(ubic.departamentos[0].nombre === 'Norte de Santander', 'Norte de Santander va de primero')
  assert(nds.municipios[0] === 'Cúcuta', 'Cúcuta encabeza la lista de municipios')

  // 2) El registro valida contra esa tabla: ya no acepta cualquier texto
  const ciudadFalsa = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      registroValido({ email: testEmail(), docNum: testDocNum(), dept: 'Norte de Santander', city: 'Ciudad Inventada' }),
    ),
  })
  assert(ciudadFalsa.status === 400, 'registrarse con una ciudad inexistente responde 400')

  const deptFalso = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), dept: 'Narnia', city: 'Cúcuta' }))
  })
  assert(deptFalso.status === 400, 'registrarse con un departamento inexistente responde 400')

  const combinacionMala = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Cúcuta existe, y Antioquia existe, pero Cúcuta no está en Antioquia.
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), dept: 'Antioquia', city: 'Cúcuta' })),
  })
  assert(combinacionMala.status === 400, 'una ciudad que no pertenece al departamento también se rechaza')

  // 3) Límite de giros: un visitante nuevo tiene sus 3
  const navegador = crearNavegador()
  const inicial = await navegador('/ruleta/giros-restantes')
  assert(inicial.body?.maximo === GIROS_ESPERADOS, `el máximo es ${GIROS_ESPERADOS} giros`)
  assert(inicial.body?.restantes === GIROS_ESPERADOS, 'un visitante nuevo tiene todos sus giros')

  // 4) Los giros se consumen y el contador baja
  for (let i = 1; i <= GIROS_ESPERADOS; i++) {
    const giro = await navegador('/ruleta/girar-anonimo', { method: 'POST' })
    assert(giro.status === 200, `el giro ${i} de ${GIROS_ESPERADOS} se permite`)
    assert(
      giro.body?.restantes === GIROS_ESPERADOS - i,
      `tras el giro ${i} quedan ${GIROS_ESPERADOS - i} (recibido: ${giro.body?.restantes})`,
    )
  }

  // 5) El cuarto se rechaza. Este es el caso del que había que defenderse:
  //    recargar para volver a tirar hasta sacar el premio deseado.
  const cuarto = await navegador('/ruleta/girar-anonimo', { method: 'POST' })
  assert(cuarto.status === 429, 'el cuarto giro se rechaza con 429')
  assert(cuarto.body?.restantes === 0, 'el rechazo informa que no quedan giros')

  // 6) Recargar la página no reinicia nada: es la misma cookie
  const trasRecargar = await navegador('/ruleta/giros-restantes')
  assert(trasRecargar.body?.restantes === 0, 'recargar la página NO devuelve giros')
  const quintoIntento = await navegador('/ruleta/girar-anonimo', { method: 'POST' })
  assert(quintoIntento.status === 429, 'insistir después de recargar sigue dando 429')

  // 7) Un visitante distinto (otra cookie) sí tiene sus giros. Esto es a la
  //    vez la limitación conocida: modo incógnito equivale a un visitante
  //    nuevo. Se prueba para dejarlo explícito, no para celebrarlo.
  const otroNavegador = crearNavegador()
  const otro = await otroNavegador('/ruleta/giros-restantes')
  assert(otro.body?.restantes === GIROS_ESPERADOS, 'otro visitante empieza con sus giros completos')

  // 8) La cookie es httpOnly: el JavaScript de la página no puede borrarla
  const conSetCookie = await fetch(`${BASE}/ruleta/girar-anonimo`, { method: 'POST' })
  const cabecera = conSetCookie.headers.get('set-cookie') ?? ''
  assert(/HttpOnly/i.test(cabecera), 'la cookie de visitante se emite como HttpOnly')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
