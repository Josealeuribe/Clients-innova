// Integridad de los tokens de sesión y de los tickets de premio.
//
// Un JWT solo protege si el servidor VERIFICA la firma. Estas pruebas intentan
// pasar tokens rotos, ajenos y manipulados para comprobar que ninguno cuela.

import { pedir, conToken, entrar, crearSuite, CUENTAS } from './_utilidades.mjs'

const { verificar, cerrar } = crearSuite('SEG-02 · Tokens, firmas y sesiones')

// Cambia un carácter del payload de un JWT sin recalcular la firma. Si el
// servidor no verifica, lo aceptaría.
function manipularPayload(token) {
  const [cabecera, payload, firma] = token.split('.')
  const datos = JSON.parse(Buffer.from(payload, 'base64url').toString())
  datos.rol = 'admin'
  datos.usuarioId = 1
  const nuevo = Buffer.from(JSON.stringify(datos)).toString('base64url')
  return `${cabecera}.${nuevo}.${firma}`
}

// JWT bien formado pero firmado con otro secreto.
function firmadoConOtroSecreto() {
  const cabecera = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({ tipo: 'staff', usuarioId: 1, email: 'admin@grancasino.com.co', rol: 'admin' }),
  ).toString('base64url')
  return `${cabecera}.${payload}.firmaInventadaQueNoCorresponde`
}

// JWT con alg:none — el ataque clásico contra librerías mal configuradas.
function algNone() {
  const cabecera = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({ tipo: 'staff', usuarioId: 1, email: 'admin@grancasino.com.co', rol: 'admin' }),
  ).toString('base64url')
  return `${cabecera}.${payload}.`
}

async function main() {
  const tokenCajero = await entrar(...CUENTAS.cajeroAv0)
  verificar(!!tokenCajero, 'sesión de cajero obtenida')

  // 1) Tokens inválidos en sus varias formas
  const invalidos = [
    ['vacío', ''],
    ['basura', 'esto-no-es-un-jwt'],
    ['payload manipulado a rol admin', manipularPayload(tokenCajero)],
    ['firmado con otro secreto', firmadoConOtroSecreto()],
    ['alg: none', algNone()],
    ['JWT bien formado pero truncado', tokenCajero.slice(0, -6)],
  ]

  for (const [descripcion, token] of invalidos) {
    const res = await pedir('/auth/me', { headers: conToken(token) })
    verificar(res.status === 401, `token ${descripcion} → 401`, `respondió ${res.status}`)
  }

  // 2) Lo importante del payload manipulado: no debe escalar a admin
  const escalado = await pedir('/admin/clientes', { headers: conToken(manipularPayload(tokenCajero)) })
  verificar(
    escalado.status === 401,
    'manipular el payload para decir rol=admin NO da acceso al panel de administración',
    `respondió ${escalado.status}`,
  )

  // 3) Cabecera Authorization mal formada
  const malFormadas = [
    ['sin el prefijo Bearer', { Authorization: tokenCajero }],
    ['prefijo equivocado', { Authorization: `Token ${tokenCajero}` }],
    ['Bearer sin token', { Authorization: 'Bearer ' }],
    ['Basic auth', { Authorization: 'Basic YWRtaW46YWRtaW4=' }],
  ]
  for (const [descripcion, headers] of malFormadas) {
    const res = await pedir('/cajero/sedes', { headers })
    verificar(res.status === 401, `Authorization ${descripcion} → 401`, `respondió ${res.status}`)
  }

  // 4) El ticket de premio también va firmado: uno inventado no debe dar bono
  const registro = await pedir('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nombres: 'Prueba', apellidos: 'Automatizada', docType: 'Cédula de Ciudadanía',
      docNum: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      birth: '1995-05-05', phone: '3001234567', dept: 'Norte de Santander', city: 'Cúcuta',
      email: `test-e2e-${Math.random().toString(36).slice(2, 10)}@example.com`,
      pass: 'Passw0rd', passConfirm: 'Passw0rd',
      terminos: true, datos: true, edad: true, promo: true, comms: false,
      ticket: algNone(),
    }),
  })
  verificar(registro.status === 201, 'un ticket falso no rompe el registro: la cuenta se crea igual')
  verificar(registro.body?.bono === null, 'pero NO se asigna ningún bono con un ticket falso')

  // 5) La contraseña nunca sale en las respuestas
  const login = await pedir('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: CUENTAS.admin[0], password: CUENTAS.admin[1] }),
  })
  verificar(
    !/passwordHash|password/i.test(login.texto),
    'la respuesta del login no contiene el hash ni la contraseña',
  )

  const me = await pedir('/auth/me', { headers: conToken(login.body.token) })
  verificar(!/passwordHash/i.test(me.texto), '/auth/me tampoco expone el hash')

  // 6) El login no revela si el correo existe: mismo mensaje en ambos casos
  const inexistente = await pedir('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'nadie-existe@ejemplo.com', password: 'loquesea' }),
  })
  const claveMala = await pedir('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: CUENTAS.admin[0], password: 'claveIncorrecta' }),
  })
  verificar(inexistente.status === 401 && claveMala.status === 401, 'ambos fallos de login responden 401')
  verificar(
    inexistente.body?.error === claveMala.body?.error,
    'el mensaje es idéntico: no se puede deducir si un correo está registrado',
    `"${inexistente.body?.error}" vs "${claveMala.body?.error}"`,
  )

  return cerrar()
}

main().then((ok) => process.exit(ok ? 0 : 1))
