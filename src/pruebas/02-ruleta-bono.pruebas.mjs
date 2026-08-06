import { api, authHeader, createSuite, registroValido, testEmail, testDocNum } from './_helpers.mjs'

const { assert, finish } = createSuite('02 - Ruleta, asignación de bono y unicidad de códigos')

const CLAVES_VALIDAS = [
  'bono-5000', 'bono-10000', 'bono-20000',
  'carton-bingo', 'entrada-evento', 'bono-50000', 'premio-sorpresa',
]

async function main() {
  // 1) Giro anónimo: no requiere sesión y devuelve un premio + ticket
  const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
  assert(giro.status === 200, 'POST /ruleta/girar-anonimo (sin auth) responde 200')
  assert(CLAVES_VALIDAS.includes(giro.body?.premio?.clave), 'el premio devuelto tiene una clave válida del catálogo')
  assert(typeof giro.body?.ticket === 'string' && giro.body.ticket.length > 20, 'se recibe un ticket firmado')

  // 2) El catálogo completo debe verse en al menos ~40 giros (8 premios,
  //    el más raro tiene weight 4/100 → probabilidad de no verlo en 40 giros es baja)
  const clavesVistas = new Set()
  for (let i = 0; i < 40; i++) {
    const s = await api('/ruleta/girar-anonimo', { method: 'POST' })
    clavesVistas.add(s.body?.premio?.clave)
  }
  assert(clavesVistas.size >= 5, `se observó variedad real de premios en 40 giros (vistos: ${clavesVistas.size}/7)`)

  // 3) Registrar reclamando el ticket asigna el bono correspondiente. Ya no
  //    hay premios sin bono: el giro adicional se retiró de la promoción.
  const giroCanjeable = await api('/ruleta/girar-anonimo', { method: 'POST' })
  const registro = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giroCanjeable.body.ticket })),
  })
  assert(registro.status === 201, 'registro con ticket responde 201')
  assert(registro.body?.bono?.premio?.clave === giroCanjeable.body.premio.clave, 'el bono asignado corresponde exactamente al premio girado')
  assert(/^GCC-\d{4}-[0-9A-F]{6}$/.test(registro.body?.bono?.codigo || ''), 'el código de canje tiene el formato esperado (GCC-AAAA-XXXXXX)')
  assert(registro.body?.bono?.estado === 'pendiente', 'el bono nuevo queda en estado "pendiente"')
  const token1 = registro.body.token

  // 4) Un segundo giro + registro (otro cliente) debe recibir un código DISTINTO
  const giro2 = await api('/ruleta/girar-anonimo', { method: 'POST' })
  const registro2 = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giro2.body.ticket })),
  })
  assert(registro2.status === 201, 'segundo registro con ticket responde 201')
  assert(
    registro2.body?.bono?.codigo !== registro.body?.bono?.codigo,
    `el código del segundo cliente es distinto al del primero (${registro.body?.bono?.codigo} vs ${registro2.body?.bono?.codigo})`,
  )

  // 5) Ticket inválido/manipulado: el registro debe completarse SIN bono, no fallar
  const registroSinBono = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: 'ticket-invalido-manipulado' })),
  })
  assert(registroSinBono.status === 201, 'registro con ticket inválido igual crea la cuenta (201)')
  assert(registroSinBono.body?.bono === null, 'no se asigna ningún bono si el ticket no es válido')
  assert(!!registroSinBono.body?.bonoError, 'se informa un bonoError explicando por qué no hay bono')

  // 6) Registro sin ticket en absoluto (llegó por "Registrarse" del navbar, no por la ruleta)
  const registroDirecto = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum() })),
  })
  assert(registroDirecto.status === 201, 'registro directo sin pasar por la ruleta también funciona (201)')
  assert(registroDirecto.body?.bono === null, 'sin ticket, la cuenta se crea sin bono (correcto)')

  // 7) El cliente ve su bono pendiente en /auth/me
  const me = await api('/auth/me', { headers: authHeader(token1) })
  assert(me.body?.bono?.estado === 'pendiente', 'el cliente ve su bono pendiente en /auth/me')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
