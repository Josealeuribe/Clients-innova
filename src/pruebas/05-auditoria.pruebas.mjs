// Auditoría de canjes y búsqueda por documento.
//
// Cubre el caso real de sede: el cliente llega sin celular y sin recordar su
// código. Con la cédula, el cajero debe poder recuperar al titular, ver si
// tiene un bono vigente y entregárselo; y si ya lo redimió, poder decirle
// exactamente cuándo y dónde, en vez de un "no aparece nada".

import {
  api,
  authHeader,
  createSuite,
  registroValido,
  testEmail,
  testDocNum,
} from './_helpers.mjs'

const { assert, finish } = createSuite('05 - Auditoría de canjes y búsqueda por documento')

const ADMIN_CREDS = { identifier: 'admin@grancasino.com.co', password: 'AdminCucuta0508' }
const CAJERO_CREDS = { identifier: 'cajero@grancasino.com.co', password: 'CajeroCucuta0805' }

async function main() {
  const admin = await api('/auth/login', { method: 'POST', body: JSON.stringify(ADMIN_CREDS) })
  const cajero = await api('/auth/login', { method: 'POST', body: JSON.stringify(CAJERO_CREDS) })
  const adminToken = admin.body.token
  const cajeroToken = cajero.body.token

  // Cliente con bono pendiente
  const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
  const docNumero = testDocNum()
  const registro = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: docNumero, ticket: giro.body.ticket })),
  })
  const clienteToken = registro.body.token
  const codigo = registro.body.bono.codigo

  // 0) Cada bono queda asignado a un casino concreto: el cliente debe saber a
  //    cuál de las 3 sedes ir, no "a cualquiera".
  const sedesCatalogo = await api('/cajero/sedes', { headers: authHeader(cajeroToken) })
  assert(sedesCatalogo.body?.sedes?.length === 3, 'el catálogo de sedes sale de la tabla `sedes` y trae las 3')
  assert(
    sedesCatalogo.body.sedes.every((s) => !!s.nombre && !!s.direccion),
    'cada sede trae nombre y dirección para mostrarle al cliente',
  )

  const me = await api('/auth/me', { headers: authHeader(clienteToken) })
  assert(!!me.body?.bono?.sedeRedencion, 'el bono del cliente dice en qué casino redimirlo')
  assert(
    sedesCatalogo.body.sedes.some((s) => s.clave === me.body.bono.sedeRedencion.clave),
    'esa sede pertenece al catálogo real',
  )
  assert(!!me.body?.bono?.sedeRedencion?.direccion, 'se le da también la dirección del casino')

  // 1) Búsqueda por documento con bono ACTIVO
  const busqueda = await api(`/cajero/cliente/${docNumero}`, { headers: authHeader(cajeroToken) })
  assert(busqueda.status === 200, 'buscar por documento responde 200')
  assert(busqueda.body?.cliente?.docNumero === docNumero, 'devuelve al titular correcto')
  assert(!!busqueda.body?.cliente?.nombres, 'devuelve el nombre para cotejar contra la cédula física')
  assert(busqueda.body?.bono?.estado === 'pendiente', 'indica que el cliente tiene un bono activo')
  assert(busqueda.body?.bono?.codigo === codigo, 'recupera el código sin que el cliente lo traiga')

  // 2) Documento inexistente
  const inexistente = await api('/cajero/cliente/00000000000', { headers: authHeader(cajeroToken) })
  assert(inexistente.status === 404, 'un documento no registrado responde 404')

  // 3) Un cliente normal no puede usar la búsqueda
  const clienteBusca = await api(`/cajero/cliente/${docNumero}`, { headers: authHeader(clienteToken) })
  assert(clienteBusca.status === 403, 'un cliente NO puede buscar por documento (403)')

  // 4) Canje usando el código recuperado por cédula. No se envía sede: sale
  //    del casino asignado al premio.
  assert(!!busqueda.body.bono.sedeRedencion, 'la búsqueda por cédula dice a qué casino debe ir el cliente')
  // Lo que se registra al canjear es el casino del cajero, no el del premio.
  const sede = cajero.body?.staff?.sede
  assert(!!sede, 'la sesión del cajero trae su casino')
  const canje = await api(`/cajero/codigo/${busqueda.body.bono.codigo}/canjear`, {
    method: 'POST',
    headers: authHeader(cajeroToken),
  })
  assert(canje.status === 200, 'se puede canjear con el código recuperado por cédula')

  // 5) Tras el canje, la búsqueda por documento sirve de auditoría
  const trasCanje = await api(`/cajero/cliente/${docNumero}`, { headers: authHeader(cajeroToken) })
  assert(trasCanje.body?.bono?.estado === 'reclamado', 'la búsqueda muestra el bono ya redimido')
  assert(trasCanje.body?.bono?.sede === sede.nombre, 'la búsqueda dice en qué sede se entregó')
  assert(!!trasCanje.body?.bono?.canjeadoEn, 'la búsqueda dice cuándo se entregó')
  assert(trasCanje.body?.bono?.canjeadoPor === 'Cajero', 'la búsqueda dice qué cajero lo entregó')

  // 6) Auditoría del admin
  const auditoria = await api('/admin/canjes', { headers: authHeader(adminToken) })
  assert(auditoria.status === 200, 'GET /admin/canjes responde 200')
  const fila = auditoria.body?.canjes?.find((c) => c.codigo === codigo)
  assert(!!fila, 'el canje aparece en la auditoría del admin')
  assert(fila?.cliente?.docNumero === docNumero, 'la auditoría identifica al cliente por documento')
  assert(fila?.sede === sede.nombre, 'la auditoría registra la sede')
  assert(fila?.canjeadoPor === 'Cajero', 'la auditoría registra el cajero que entregó')
  assert(typeof fila?.horasHastaCanje === 'number', 'la auditoría calcula la demora entre ganar y redimir')
  assert(fila?.horasHastaCanje >= 0, 'la demora no es negativa')

  // 7) Solo el admin ve la auditoría completa
  const cajeroVeAuditoria = await api('/admin/canjes', { headers: authHeader(cajeroToken) })
  assert(cajeroVeAuditoria.status === 403, 'un cajero NO puede ver /admin/canjes (403)')

  const sinToken = await api('/admin/canjes')
  assert(sinToken.status === 401, 'sin sesión, /admin/canjes responde 401')

  // 8) La auditoría solo lista bonos ya entregados
  const todosReclamados = auditoria.body?.canjes?.every((c) => !!c.canjeadoEn)
  assert(todosReclamados, 'todas las filas de la auditoría corresponden a bonos entregados')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
