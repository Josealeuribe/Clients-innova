import { api, authHeader, createSuite, registroValido, testEmail, testDocNum } from './_helpers.mjs'

const { assert, finish } = createSuite('03 - Roles de staff, canje de bonos e historial')

const ADMIN_CREDS = { identifier: 'admin@grancasino.com.co', password: 'AdminCucuta0508' }
const CAJERO_CREDS = { identifier: 'cajero@grancasino.com.co', password: 'CajeroCucuta0805' }

async function main() {
  // 1) Login de staff (mismo endpoint que los clientes, por el mismo formulario del navbar)
  const loginAdmin = await api('/auth/login', { method: 'POST', body: JSON.stringify(ADMIN_CREDS) })
  assert(loginAdmin.status === 200, 'login de admin responde 200')
  assert(loginAdmin.body?.tipo === 'staff' && loginAdmin.body?.staff?.rol === 'admin', 'login de admin devuelve tipo=staff, rol=admin')
  const adminToken = loginAdmin.body?.token

  const loginCajero = await api('/auth/login', { method: 'POST', body: JSON.stringify(CAJERO_CREDS) })
  assert(loginCajero.status === 200, 'login de cajero responde 200')
  assert(loginCajero.body?.tipo === 'staff' && loginCajero.body?.staff?.rol === 'cajero', 'login de cajero devuelve tipo=staff, rol=cajero')
  const cajeroToken = loginCajero.body?.token

  // 2) Preparar un cliente con bono pendiente para canjear.
  const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
  const registro = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giro.body.ticket })),
  })
  const clienteToken = registro.body.token
  assert(!!registro.body?.bono, 'el cliente de prueba queda con un bono pendiente que canjear')
  const codigo = registro.body.bono.codigo

  // 3) Control de acceso por rol
  const clienteVeAdmin = await api('/admin/clientes', { headers: authHeader(clienteToken) })
  assert(clienteVeAdmin.status === 403, 'un cliente normal NO puede ver /admin/clientes (403)')

  const cajeroVeAdmin = await api('/admin/clientes', { headers: authHeader(cajeroToken) })
  assert(cajeroVeAdmin.status === 403, 'un cajero NO puede ver /admin/clientes (403, solo admin)')

  const sinTokenVeAdmin = await api('/admin/clientes')
  assert(sinTokenVeAdmin.status === 401, 'sin sesión, /admin/clientes responde 401')

  const clienteCanjea = await api(`/cajero/codigo/${codigo}`, { headers: authHeader(clienteToken) })
  assert(clienteCanjea.status === 403, 'un cliente normal NO puede usar el módulo de cajero (403)')

  // 4) Admin sí puede ver el listado y encuentra al cliente con bono pendiente
  const listadoAntes = await api('/admin/clientes', { headers: authHeader(adminToken) })
  assert(listadoAntes.status === 200, 'admin sí puede ver /admin/clientes (200)')
  const filaAntes = listadoAntes.body?.clientes?.find((c) => c.email === registro.body.cliente.email)
  assert(!!filaAntes, 'el admin ve al cliente recién registrado en el listado')
  assert(filaAntes?.bono?.estado === 'pendiente', 'el admin ve el bono en estado "pendiente" antes del canje')

  // 5) Cajero: vista previa del código antes de confirmar
  const preview = await api(`/cajero/codigo/${codigo}`, { headers: authHeader(cajeroToken) })
  assert(preview.status === 200, 'cajero puede consultar la vista previa del código (200)')
  assert(preview.body?.cliente?.docNumero === registro.body.cliente.docNumero, 'la vista previa muestra el documento correcto del cliente')
  assert(preview.body?.estado === 'pendiente', 'la vista previa indica que el bono aún no ha sido canjeado')

  // 6) Código inexistente -> 404
  const previewInexistente = await api('/cajero/codigo/GCC-0000-0000', { headers: authHeader(cajeroToken) })
  assert(previewInexistente.status === 404, 'consultar un código inexistente responde 404')

  // 7) Cliente ve su bono ANTES de canjear
  const meAntes = await api('/auth/me', { headers: authHeader(clienteToken) })
  assert(!!meAntes.body?.bono, 'el cliente ve su bono en /auth/me antes del canje')

  // 8) Catálogo de sedes (lo consume el panel de admin, ya no un select)
  const sedes = await api('/cajero/sedes', { headers: authHeader(cajeroToken) })
  assert(sedes.status === 200, 'GET /cajero/sedes responde 200')
  assert(sedes.body?.sedes?.length === 3, 'el catálogo devuelve las 3 sedes de Gran Casino Cúcuta')

  // 9) La vista previa dice a qué casino pertenece el bono
  assert(!!preview.body?.sedeRedencion, 'la vista previa indica el casino asignado al bono')
  const sedeAsignada = preview.body.sedeRedencion

  // 10) El canje ya NO pide sede: se deduce del premio
  const canje = await api(`/cajero/codigo/${codigo}/canjear`, {
    method: 'POST',
    headers: authHeader(cajeroToken),
  })
  assert(canje.status === 200, 'confirmar el canje sin enviar sede responde 200')
  assert(canje.body?.estado === 'reclamado', 'tras canjear, el estado pasa a "reclamado"')
  assert(
    canje.body?.sedeCanje === sedeAsignada.nombre,
    'la sede del canje se tomó automáticamente del casino asignado al premio',
  )

  // 11) El bono NO desaparece para el cliente: queda como constancia de que
  //     lo redimió, con la fecha y la sede de entrega. (Antes se ocultaba;
  //     se cambió para que el cliente conserve su comprobante.)
  const meDespues = await api('/auth/me', { headers: authHeader(clienteToken) })
  assert(!!meDespues.body?.bono, 'el bono sigue visible para el cliente después del canje')
  assert(meDespues.body?.bono?.estado === 'reclamado', 'el cliente ve su bono en estado "reclamado"')
  assert(!!meDespues.body?.bono?.canjeadoEn, 'el cliente ve la fecha en que se le entregó el bono')
  assert(meDespues.body?.bono?.sede === sedeAsignada.nombre, 'el cliente ve en qué sede se le entregó')

  assert(meDespues.body?.yaParticipo === true, 'tras el canje, /auth/me sigue marcando yaParticipo=true')
  assert(meDespues.body?.bonoCanjeado === true, 'tras el canje, /auth/me marca bonoCanjeado=true')

  // 12) No se puede canjear el mismo código dos veces
  const canjeDuplicado = await api(`/cajero/codigo/${codigo}/canjear`, {
    method: 'POST',
    headers: authHeader(cajeroToken),
  })
  assert(canjeDuplicado.status === 409, 'intentar canjear el mismo código otra vez responde 409')

  // 13) El historial de canjes incluye este canje con el cajero y la sede
  const historial = await api('/cajero/historial', { headers: authHeader(cajeroToken) })
  assert(historial.status === 200, 'GET /cajero/historial responde 200')
  const filaHistorial = historial.body?.canjes?.find((h) => h.codigo === codigo)
  assert(!!filaHistorial, 'el canje recién hecho aparece en el historial')
  assert(filaHistorial?.canjeadoPor === 'Cajero', 'el historial registra qué cajero hizo el canje')
  assert(filaHistorial?.sede === sedeAsignada.nombre, 'el historial registra en qué sede se entregó el bono')

  // 14) El admin ahora ve el bono como "reclamado" (a diferencia del cliente)
  const listadoDespues = await api('/admin/clientes', { headers: authHeader(adminToken) })
  const filaDespues = listadoDespues.body?.clientes?.find((c) => c.email === registro.body.cliente.email)
  assert(filaDespues?.bono?.estado === 'reclamado', 'el admin sí ve el bono como "reclamado" (vista completa, no filtrada)')
  assert(filaDespues?.bono?.sede === sedeAsignada.nombre, 'el admin también ve la sede del canje')

  // 15) La vista previa del cajero trae los datos con los que se verifica al
  //     cliente contra su documento fisico antes de entregar el bono.
  const previewFinal = await api(`/cajero/codigo/${codigo}`, { headers: authHeader(cajeroToken) })
  assert(previewFinal.body?.cliente?.nombres === registro.body.cliente.nombres, 'la vista previa trae el nombre del cliente')
  assert(!!previewFinal.body?.cliente?.email, 'la vista previa trae el correo del cliente')
  assert(!!previewFinal.body?.cliente?.telefono, 'la vista previa trae el celular del cliente')
  assert(!!previewFinal.body?.cliente?.registradoEn, 'la vista previa trae la fecha de registro del cliente')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
