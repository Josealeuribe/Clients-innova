import { api, authHeader, createSuite, registroValido, datoHace, testEmail, testDocNum } from './_helpers.mjs'

const { assert, finish } = createSuite('01 - Autenticación: registro, login, disponibilidad, duplicados')

async function main() {
  const email = testEmail()
  const docNum = testDocNum()

  // 1) Disponibilidad ANTES de registrar: ambos deben estar libres
  const disponibilidadAntes = await api(`/auth/disponibilidad?email=${email}&docNum=${docNum}`)
  assert(disponibilidadAntes.status === 200, 'GET /auth/disponibilidad responde 200')
  assert(disponibilidadAntes.body.emailDisponible === true, 'correo nuevo reporta disponible=true')
  assert(disponibilidadAntes.body.docNumDisponible === true, 'documento nuevo reporta disponible=true')

  // 2) Registro válido
  const datos = registroValido({ email, docNum })
  const registro = await api('/auth/register', { method: 'POST', body: JSON.stringify(datos) })
  assert(registro.status === 201, 'registro válido responde 201')
  assert(!!registro.body?.token, 'registro devuelve token de sesión')
  assert(registro.body?.cliente?.email === email, 'el cliente devuelto tiene el email correcto')
  assert(registro.body?.tipo === 'cliente', 'tipo de sesión es "cliente"')
  const token = registro.body?.token

  // 3) Disponibilidad DESPUÉS de registrar: ya no deben estar libres (tiempo real)
  const disponibilidadDespues = await api(`/auth/disponibilidad?email=${email}&docNum=${docNum}`)
  assert(disponibilidadDespues.body.emailDisponible === false, 'correo ya registrado reporta disponible=false')
  assert(disponibilidadDespues.body.docNumDisponible === false, 'documento ya registrado reporta disponible=false')

  // 4) No se permiten datos repetidos: mismo correo, documento distinto -> 409
  const dupEmail = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email, docNum: testDocNum() })),
  })
  assert(dupEmail.status === 409, 'registrar con el mismo correo responde 409')

  // 5) No se permiten datos repetidos: mismo documento, correo distinto -> 409
  const dupDoc = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum })),
  })
  assert(dupDoc.status === 409, 'registrar con el mismo documento responde 409')

  // 6) Validación de edad: menor de 18 años -> 400
  const menorEdad = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), birth: datoHace(10) })),
  })
  assert(menorEdad.status === 400, 'registrar con menos de 18 años responde 400')
  assert(/mayor de 18/i.test(menorEdad.body?.error || ''), 'el mensaje de error menciona mayoría de edad')

  // 7) Validación de fecha inválida (formato imposible) -> 400
  const fechaInvalida = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), birth: 'no-es-una-fecha' })),
  })
  assert(fechaInvalida.status === 400, 'registrar con fecha de nacimiento inválida responde 400')

  // 8) Login correcto
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: email, password: 'Passw0rd' }),
  })
  assert(login.status === 200, 'login con credenciales correctas responde 200')
  assert(login.body?.tipo === 'cliente', 'login de cliente devuelve tipo "cliente"')

  // 9) Login con contraseña incorrecta
  const loginMalo = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: email, password: 'incorrecta' }),
  })
  assert(loginMalo.status === 401, 'login con contraseña incorrecta responde 401')

  // 10) Login con identificador inexistente
  const loginInexistente = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: testEmail(), password: 'Passw0rd' }),
  })
  assert(loginInexistente.status === 401, 'login con correo inexistente responde 401')

  // 11) /auth/me con el token devuelve la sesión correcta
  const me = await api('/auth/me', { headers: authHeader(token) })
  assert(me.status === 200, 'GET /auth/me con token válido responde 200')
  assert(me.body?.cliente?.email === email, '/auth/me devuelve el cliente correcto')

  // 12) /auth/me sin token
  const meSinToken = await api('/auth/me')
  assert(meSinToken.status === 401, 'GET /auth/me sin token responde 401')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
