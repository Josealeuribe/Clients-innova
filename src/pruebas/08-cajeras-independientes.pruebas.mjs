// Cada cajera ve únicamente los bonos que ella entregó; el admin los ve todos
// y sabe quién entregó cada uno.
//
// Importa porque el panel de una cajera es su caja: el movimiento de sus
// compañeras no es asunto suyo, y la trazabilidad de quién entregó qué es
// justamente lo que hace auditable la promoción.

import { api, authHeader, createSuite, registroValido, testEmail, testDocNum } from './_helpers.mjs'

const { assert, finish } = createSuite('08 - Cajeras independientes y auditoría del admin')

const ADMIN = { identifier: 'admin@grancasino.com.co', password: 'AdminCucuta0508' }
const CAJERA_A = { identifier: 'alisson.cespedes@grancasino.com.co', password: 'Alisson1091968222' }
const CAJERA_B = { identifier: 'lesly.naranjo@grancasino.com.co', password: 'Lesly1093801936' }

async function entrar(credenciales) {
  const res = await api('/auth/login', { method: 'POST', body: JSON.stringify(credenciales) })
  return { status: res.status, token: res.body?.token, staff: res.body?.staff }
}

// Crea un cliente con bono pendiente y devuelve su código.
async function bonoNuevo() {
  const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
  const registro = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giro.body.ticket })),
  })
  return registro.body.bono.codigo
}

async function main() {
  // 1) Las cajeras reales pueden entrar con sus credenciales
  const a = await entrar(CAJERA_A)
  assert(a.status === 200, 'Alisson puede iniciar sesión')
  assert(a.staff?.rol === 'cajero', 'entra con rol de cajero')
  assert(a.staff?.nombre === 'Alisson Nicole Céspedes Figueroa', 'su nombre completo queda en la sesión')

  const b = await entrar(CAJERA_B)
  assert(b.status === 200, 'Lesly puede iniciar sesión')

  const admin = await entrar(ADMIN)
  assert(admin.status === 200, 'el admin sigue entrando')

  // 2) Cada una canjea un bono distinto
  const codigoA = await bonoNuevo()
  const codigoB = await bonoNuevo()

  const canjeA = await api(`/cajero/codigo/${codigoA}/canjear`, { method: 'POST', headers: authHeader(a.token) })
  assert(canjeA.status === 200, 'Alisson canjea su bono')

  const canjeB = await api(`/cajero/codigo/${codigoB}/canjear`, { method: 'POST', headers: authHeader(b.token) })
  assert(canjeB.status === 200, 'Lesly canjea el suyo')

  // 3) Aislamiento: cada una ve el suyo y NO el de la otra
  const histA = await api('/cajero/historial', { headers: authHeader(a.token) })
  const codigosA = histA.body.canjes.map((c) => c.codigo)
  assert(histA.body?.soloPropios === true, 'a una cajera se le marca la vista como propia')
  assert(codigosA.includes(codigoA), 'Alisson ve el bono que ella entregó')
  assert(!codigosA.includes(codigoB), 'Alisson NO ve el bono que entregó Lesly')

  const histB = await api('/cajero/historial', { headers: authHeader(b.token) })
  const codigosB = histB.body.canjes.map((c) => c.codigo)
  assert(codigosB.includes(codigoB), 'Lesly ve el bono que ella entregó')
  assert(!codigosB.includes(codigoA), 'Lesly NO ve el bono que entregó Alisson')

  // Ninguna ve canjes ajenos en absoluto, no solo estos dos.
  const todosDeA = histA.body.canjes.every((c) => c.canjeadoPor === 'Alisson Nicole Céspedes Figueroa')
  assert(todosDeA, 'todo lo que ve Alisson fue entregado por ella')

  // 4) El admin sí ve ambos, con el nombre de quién entregó cada uno
  const auditoria = await api('/admin/canjes', { headers: authHeader(admin.token) })
  const filaA = auditoria.body.canjes.find((c) => c.codigo === codigoA)
  const filaB = auditoria.body.canjes.find((c) => c.codigo === codigoB)
  assert(!!filaA && !!filaB, 'el admin ve los canjes de ambas cajeras')
  assert(filaA.canjeadoPor === 'Alisson Nicole Céspedes Figueroa', 'la auditoría nombra a quien entregó el primero')
  assert(filaB.canjeadoPor === 'Lesly Viviana Naranjo Gordillo', 'y a quien entregó el segundo')

  // 5) Una cajera no puede asomarse a la auditoría completa
  const cajeraEnAuditoria = await api('/admin/canjes', { headers: authHeader(a.token) })
  assert(cajeraEnAuditoria.status === 403, 'una cajera NO puede ver /admin/canjes (403)')

  // 6) El admin, entrando por el panel de cajero, sí ve todo
  const histAdmin = await api('/cajero/historial', { headers: authHeader(admin.token) })
  assert(histAdmin.body?.soloPropios === false, 'al admin no se le recorta la vista')
  const codigosAdmin = histAdmin.body.canjes.map((c) => c.codigo)
  assert(
    codigosAdmin.includes(codigoA) && codigosAdmin.includes(codigoB),
    'el admin ve los canjes de todas las cajeras',
  )

  // 7) Las 7 cajeras reales existen y pueden entrar
  const CAJERAS = [
    ['liliana.alfonso@grancasino.com.co', 'Liliana1090400663'],
    ['sulay.castro@grancasino.com.co', 'Sulay68295264'],
    ['mayeli.rojas@grancasino.com.co', 'Mayeli1090494259'],
    ['stefany.alvarez@grancasino.com.co', 'Stefany1005035932'],
    ['lorena.jaimes@grancasino.com.co', 'Lorena60264827'],
  ]
  for (const [identifier, password] of CAJERAS) {
    const sesion = await entrar({ identifier, password })
    assert(sesion.status === 200 && sesion.staff?.rol === 'cajero', `${identifier} puede iniciar sesión`)
  }

  // 8) Una cajera no puede entrar al panel de administración
  const cajeraEnAdmin = await api('/admin/clientes', { headers: authHeader(a.token) })
  assert(cajeraEnAdmin.status === 403, 'una cajera NO puede ver el listado de clientes (403)')

  return finish()
}

main().then((ok) => process.exit(ok ? 0 : 1))
