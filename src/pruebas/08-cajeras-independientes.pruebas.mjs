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

// Crea un cliente con bono pendiente EN LA SEDE PEDIDA y devuelve su código.
// Se gira hasta que salga un premio de esa sede: desde que el canje cruzado
// está prohibido, un bono de otro casino no le sirve a una cajera concreta.
async function bonoNuevoEn(claveSede, intentos = 40) {
  for (let i = 0; i < intentos; i++) {
    const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
    const registro = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giro.body.ticket })),
    })
    if (registro.body?.bono?.sedeRedencion?.clave === claveSede) return registro.body.bono.codigo
  }
  throw new Error(`No salió ningún premio de la sede "${claveSede}" en ${intentos} giros.`)
}

async function main() {
  // 1) Las cajeras reales pueden entrar con sus credenciales
  const a = await entrar(CAJERA_A)
  assert(a.status === 200, 'Alisson puede iniciar sesión')
  assert(a.staff?.rol === 'cajero', 'entra con rol de cajero')
  assert(a.staff?.nombre === 'Alisson Nicole Céspedes Figueroa', 'su nombre completo queda en la sesión')
  assert(a.staff?.sede?.clave === 'avenida-0', 'Alisson pertenece a Gran Casino Cúcuta Av. 0')
  assert(!!a.staff?.sede?.direccion, 'la sesión trae la dirección del casino, para mostrarla en el panel')

  const b = await entrar(CAJERA_B)
  assert(b.status === 200, 'Lesly puede iniciar sesión')

  assert(b.staff?.sede?.clave === 'avenida-0', 'Lesly también es de Av. 0')

  const admin = await entrar(ADMIN)
  assert(admin.status === 200, 'el admin sigue entrando')
  assert(admin.staff?.sede === null, 'el admin no pertenece a un casino concreto')

  // 2) Cada una canjea un bono distinto
  const codigoA = await bonoNuevoEn('avenida-0')
  const codigoB = await bonoNuevoEn('avenida-0')

  const canjeA = await api(`/cajero/codigo/${codigoA}/canjear`, { method: 'POST', headers: authHeader(a.token) })
  assert(canjeA.status === 200, 'Alisson canjea su bono')

  const canjeB = await api(`/cajero/codigo/${codigoB}/canjear`, { method: 'POST', headers: authHeader(b.token) })
  assert(canjeB.status === 200, 'Lesly canjea el suyo')

  // 2b) El bono solo se redime en su casino: ambas cajeras son de Av. 0, así
  //     que solo pudieron canjear bonos asignados a Av. 0.
  assert(
    canjeA.body?.sedeCanje === 'Gran Casino Cúcuta Av. 0',
    `el canje queda registrado en el casino de la cajera (recibido: ${canjeA.body?.sedeCanje})`,
  )
  assert(canjeA.body?.canjeadoPor === 'Alisson Nicole Céspedes Figueroa', 'y a nombre de quien lo entregó')
  assert(
    canjeA.body?.sedeRedencion?.clave === 'avenida-0',
    'y coincide con el casino al que estaba asignado el bono',
  )

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

  // 4b) El CLIENTE también ve dónde y quién se lo entregó, en su comprobante
  const clienteA = await api('/cajero/cliente/' + filaA.cliente.docNumero, { headers: authHeader(a.token) })
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: clienteA.body.cliente.email, password: 'Passw0rd' }),
  })
  assert(login.body?.bono?.sede === 'Gran Casino Cúcuta Av. 0', 'el cliente ve en qué casino se lo entregaron')
  assert(
    login.body?.bono?.canjeadoPor === 'Alisson Nicole Céspedes Figueroa',
    'el cliente ve quién se lo entregó',
  )

  // 4c) La auditoría del admin distingue el casino ASIGNADO del casino donde
  //     realmente se entregó. Si difieren, el bono se redimió en otra sede.
  assert(!!filaA.sede, 'la auditoría dice dónde se entregó')
  assert('sedeRedencion' in filaA, 'la auditoría también trae el casino asignado al premio')

  // 4d) EL BONO SOLO SE REDIME EN SU CASINO. Se genera uno de Ventura Plaza y
  //     se intenta canjear desde Av. 0: debe rechazarse.
  const VENTURA = { identifier: 'katalina.soto@grancasino.com.co', password: 'Katalina1093788802' }
  const ventura = await entrar(VENTURA)
  assert(ventura.staff?.sede?.clave === 'ventura-plaza', 'Katalina pertenece a Ventura Plaza')

  const codigoVentura = await bonoNuevoEn('ventura-plaza')
  const cruzado = await api(`/cajero/codigo/${codigoVentura}/canjear`, {
    method: 'POST',
    headers: authHeader(a.token), // Alisson es de Av. 0
  })
  assert(cruzado.status === 403, 'una cajera de Av. 0 NO puede redimir un bono de Ventura Plaza (403)')
  assert(!!cruzado.body?.sedeRequerida, 'el rechazo dice a qué casino debe ir el cliente')

  const intacto = await api(`/cajero/codigo/${codigoVentura}`, { headers: authHeader(a.token) })
  assert(intacto.body?.estado === 'pendiente', 'el bono rechazado sigue pendiente, no se consumió')

  const propio = await api(`/cajero/codigo/${codigoVentura}/canjear`, {
    method: 'POST',
    headers: authHeader(ventura.token),
  })
  assert(propio.status === 200, 'la cajera de Ventura Plaza sí puede redimirlo')
  assert(propio.body?.sedeCanje === 'Gran Casino Cúcuta Ventura Plaza', 'y queda registrado en su casino')

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
