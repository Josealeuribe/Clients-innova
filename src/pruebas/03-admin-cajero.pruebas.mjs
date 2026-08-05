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

  // 2) Preparar un cliente con bono pendiente para canjear
  const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
  const registro = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giro.body.ticket })),
  })
  const clienteToken = registro.body.token
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

  // 8) Cajero confirma el canje
  const canje = await api(`/cajero/codigo/${codigo}/canjear`, { method: 'POST', headers: authHeader(cajeroToken) })
  assert(canje.status === 200, 'confirmar el canje responde 200')
  assert(canje.body?.estado === 'reclamado', 'tras canjear, el estado pasa a "reclamado"')

  // 9) El bono DESAPARECE para el cliente inmediatamente después (regla explícita del negocio)
  const meDespues = await api('/auth/me', { headers: authHeader(clienteToken) })
  assert(meDespues.body?.bono === null, 'el bono desaparece de /auth/me del cliente justo después del canje')

  // 10) No se puede canjear el mismo código dos veces
  const canjeDuplicado = await api(`/cajero/codigo/${codigo}/canjear`, { method: 'POST', headers: authHeader(cajeroToken) })
  assert(canjeDuplicado.status === 409, 'intentar canjear el mismo código otra vez responde 409')

  // 11) El historial de canjes incluye este canje con el nombre del cajero
  const historial = await api('/cajero/historial', { headers: authHeader(cajeroToken) })
  assert(historial.status === 200, 'GET /cajero/historial responde 200')
  const filaHistorial = historial.body?.canjes?.find((h) => h.codigo === codigo)
  assert(!!filaHistorial, 'el canje recién hecho aparece en el historial')
  assert(filaHistorial?.canjeadoPor === 'Cajero', 'el historial registra qué cajero hizo el canje')

  // 12) El admin ahora ve el bono como "reclamado" (a diferencia del cliente)
  const listadoDespues = await api('/admin/clientes', { headers: authHeader(adminToken) })
  const filaDespues = listadoDespues.body?.clientes?.find((c) => c.email === registro.body.cliente.email)
  assert(filaDespues?.bono?.estado === 'reclamado', 'el admin sí ve el bono como "reclamado" (vista completa, no filtrada)')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
