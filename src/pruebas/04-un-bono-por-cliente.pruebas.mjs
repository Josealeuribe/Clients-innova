// Verifica la regla "un bono por persona" desde el lado del backend: los
// flags que /auth/me expone son los que la ruleta usa para bloquear un
// segundo giro cuando el cliente tiene la sesión abierta.
//
// `yaParticipo` es redundante con `bono !== null` ahora que el bono canjeado
// también se devuelve, pero se conserva como contrato explícito: la ruleta
// pregunta "¿ya participó?" y no debería tener que deducirlo del estado.

import { api, authHeader, createSuite, registrarConBonoEn, registroValido, testEmail, testDocNum } from './_helpers.mjs'

const { assert, finish } = createSuite('04 - Un bono por cliente y bloqueo del segundo giro')

const CAJERO_CREDS = { identifier: 'cajero@grancasino.com.co', password: 'CajeroCucuta0805' }

async function main() {
  // 1) Cliente registrado SIN haber girado: no tiene bono ni participación
  const sinGiro = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum() })),
  })
  assert(sinGiro.status === 201, 'registro sin ticket responde 201')
  assert(sinGiro.body?.yaParticipo === false, 'un cliente que no giró tiene yaParticipo=false')
  assert(sinGiro.body?.bono === null, 'un cliente que no giró no tiene bono')

  // 2) Cliente que giró y reclamó: queda marcado como participante
  // El bono debe ser de la sede del cajero de pruebas (Av. 0): el canje
  // cruzado entre casinos está prohibido.
  const registro = await registrarConBonoEn('avenida-0')
  const clienteToken = registro.body.token
  assert(registro.body?.yaParticipo === true, 'al reclamar el premio, el registro devuelve yaParticipo=true')
  assert(registro.body?.bonoCanjeado === false, 'un bono recién ganado todavía no está canjeado')

  // 3) El flag sobrevive a recargar la página (/auth/me) y a volver a entrar
  const me = await api('/auth/me', { headers: authHeader(clienteToken) })
  assert(me.body?.yaParticipo === true, '/auth/me mantiene yaParticipo=true al restaurar la sesión')

  const relogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: registro.body.cliente.email, password: 'Passw0rd' }),
  })
  assert(relogin.body?.yaParticipo === true, 'volver a iniciar sesión también devuelve yaParticipo=true')

  // 4) Tras el canje el bono se oculta, pero la participación NO: este es el
  //    caso que el frontend no podía detectar antes.
  const cajero = await api('/auth/login', { method: 'POST', body: JSON.stringify(CAJERO_CREDS) })
  const sedes = await api('/cajero/sedes', { headers: authHeader(cajero.body.token) })
  await api(`/cajero/codigo/${registro.body.bono.codigo}/canjear`, {
    method: 'POST',
    headers: authHeader(cajero.body.token),
    body: JSON.stringify({ sede: sedes.body.sedes[0].clave }),
  })

  const meCanjeado = await api('/auth/me', { headers: authHeader(clienteToken) })
  assert(meCanjeado.body?.bono?.estado === 'reclamado', 'tras el canje el cliente conserva el bono como constancia')
  assert(meCanjeado.body?.yaParticipo === true, 'tras el canje yaParticipo sigue en true: la ruleta debe seguir bloqueada')
  assert(meCanjeado.body?.bonoCanjeado === true, 'bonoCanjeado=true permite mostrar "Ya redimiste tu bono"')

  // 5) La ruleta rechaza a cualquier cliente con sesión abierta, tenga bono o
  //    no: es una promoción de captación. La regla se aplica en el servidor,
  //    no solo en el navegador.
  const giroConSesion = await api('/ruleta/girar-anonimo', {
    method: 'POST',
    headers: authHeader(clienteToken),
  })
  assert(giroConSesion.status === 409, 'un cliente con sesión abierta NO puede girar (409)')

  const sinBonoLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: sinGiro.body.cliente.email, password: 'Passw0rd' }),
  })
  const giroSinBono = await api('/ruleta/girar-anonimo', {
    method: 'POST',
    headers: authHeader(sinBonoLogin.body.token),
  })
  assert(giroSinBono.status === 409, 'un cliente registrado SIN bono tampoco puede girar (409)')

  // El personal tampoco participa: cajero y admin no pueden girar.
  const staff = await api('/auth/login', { method: 'POST', body: JSON.stringify(CAJERO_CREDS) })
  const giroCajero = await api('/ruleta/girar-anonimo', {
    method: 'POST',
    headers: authHeader(staff.body.token),
  })
  assert(giroCajero.status === 409, 'un CAJERO logueado NO puede girar (409)')

  const admin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'admin@grancasino.com.co', password: 'AdminCucuta0508' }),
  })
  const giroAdmin = await api('/ruleta/girar-anonimo', {
    method: 'POST',
    headers: authHeader(admin.body.token),
  })
  assert(giroAdmin.status === 409, 'un ADMIN logueado NO puede girar (409)')

  // Un token vencido o basura se trata como visitante anónimo.
  const giroTokenBasura = await api('/ruleta/girar-anonimo', {
    method: 'POST',
    headers: authHeader('token-invalido'),
  })
  assert(giroTokenBasura.status === 200, 'con un token inválido se gira como anónimo')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
