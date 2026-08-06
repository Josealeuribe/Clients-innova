// Aislamiento entre cuentas y validación de entradas.
//
// Cubre dos familias de problema:
//   · IDOR — que una cajera alcance datos de otra cambiando un identificador.
//   · Inyección y entradas hostiles en los parámetros que llegan a la base.

import { pedir, conToken, entrar, crearSuite, CUENTAS } from './_utilidades.mjs'

const { verificar, cerrar } = crearSuite('SEG-03 · Aislamiento entre cuentas y validación de entradas')

function clienteNuevo(extra = {}) {
  return {
    nombres: 'Prueba', apellidos: 'Automatizada', docType: 'Cédula de Ciudadanía',
    docNum: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
    birth: '1995-05-05', phone: '3001234567', dept: 'Norte de Santander', city: 'Cúcuta',
    email: `test-e2e-${Math.random().toString(36).slice(2, 10)}@example.com`,
    pass: 'Passw0rd', passConfirm: 'Passw0rd',
    terminos: true, datos: true, edad: true, promo: true, comms: false,
    ...extra,
  }
}

async function bonoNuevo() {
  const giro = await pedir('/ruleta/girar-anonimo', { method: 'POST' })
  const registro = await pedir('/auth/register', {
    method: 'POST',
    body: JSON.stringify(clienteNuevo({ ticket: giro.body.ticket })),
  })
  return registro.body
}

async function main() {
  const tAdmin = await entrar(...CUENTAS.admin)
  const tAv0 = await entrar(...CUENTAS.cajeroAv0)
  const tVentura = await entrar(...CUENTAS.cajeroVentura)

  // --- IDOR entre cajeras ---

  // Una cajera no puede ver el historial de otra: el endpoint no acepta
  // parámetros de usuario, el alcance lo decide el token.
  const histAv0 = await pedir('/cajero/historial', { headers: conToken(tAv0) })
  const histVentura = await pedir('/cajero/historial', { headers: conToken(tVentura) })
  verificar(histAv0.body?.soloPropios === true, 'el historial de una cajera viene acotado a lo suyo')
  const ajenos = (histAv0.body?.canjes ?? []).filter((c) => c.canjeadoPor && c.canjeadoPor !== 'Alisson Nicole Céspedes Figueroa')
  verificar(ajenos.length === 0, 'no aparece ni un canje de otra persona en su historial', `${ajenos.length} ajenos`)

  const cruzado = (histVentura.body?.canjes ?? []).some((c) =>
    (histAv0.body?.canjes ?? []).some((d) => d.codigo === c.codigo),
  )
  verificar(!cruzado, 'los historiales de dos cajeras distintas no comparten ningún canje')

  // Intentar forzar el alcance por querystring no debe funcionar.
  const forzado = await pedir('/cajero/historial?todos=1&canjeadoPorId=1', { headers: conToken(tAv0) })
  verificar(forzado.body?.soloPropios === true, 'agregar parámetros a la URL no amplía el alcance del historial')

  // --- El bono solo se redime en su casino ---
  const bono = await bonoNuevo()
  const sedeDelBono = bono.bono.sedeRedencion
  // Se elige una cajera de OTRO casino que el del bono.
  const tokenAjeno = sedeDelBono.clave === 'avenida-0' ? tVentura : tAv0
  const canjeAjeno = await pedir(`/cajero/codigo/${bono.bono.codigo}/canjear`, {
    method: 'POST',
    headers: conToken(tokenAjeno),
  })
  verificar(
    canjeAjeno.status === 403,
    `una cajera de otro casino NO puede redimir un bono de ${sedeDelBono.nombre} (403)`,
    `respondió ${canjeAjeno.status}`,
  )

  const sigueVivo = await pedir(`/cajero/codigo/${bono.bono.codigo}`, { headers: conToken(tAdmin) })
  verificar(sigueVivo.body?.estado === 'pendiente', 'el bono rechazado sigue pendiente, no quedó a medias')

  // --- Inyección y entradas hostiles ---
  const hostiles = [
    "' OR '1'='1",
    "'; DROP TABLE clientes; --",
    '<script>alert(1)</script>',
    '../../../../etc/passwd',
    '%00',
    'a'.repeat(5000),
  ]

  for (const entrada of hostiles) {
    const res = await pedir(`/cajero/cliente/${encodeURIComponent(entrada)}`, { headers: conToken(tAv0) })
    verificar(
      res.status === 404 || res.status === 400,
      `búsqueda por documento con entrada hostil se rechaza limpio (${entrada.slice(0, 22)}...)`,
      `respondió ${res.status}`,
    )
    verificar(res.status !== 500, 'y no provoca un 500 (señal de que llegó cruda a la base)')
  }

  // La base sigue en pie después de los intentos de inyección.
  const vivo = await pedir('/ubicaciones')
  verificar(vivo.status === 200 && vivo.body?.departamentos?.length > 0, 'la base sigue íntegra tras los intentos de inyección')

  // --- Validación del registro ---
  const invalidos = [
    ['menor de edad', clienteNuevo({ birth: '2015-01-01' })],
    ['correo inválido', clienteNuevo({ email: 'no-es-un-correo' })],
    ['contraseña débil', clienteNuevo({ pass: '123', passConfirm: '123' })],
    ['contraseñas que no coinciden', clienteNuevo({ passConfirm: 'OtraClave9' })],
    ['sin aceptar términos', clienteNuevo({ terminos: false })],
    ['ciudad inexistente', clienteNuevo({ city: 'Ciudad Inventada' })],
    ['tipo de documento inválido', clienteNuevo({ docType: 'Licencia de conducir' })],
  ]
  for (const [descripcion, payload] of invalidos) {
    const res = await pedir('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    verificar(res.status === 400, `registro rechazado: ${descripcion} (400)`, `respondió ${res.status}`)
  }

  // Cuerpos malformados no deben tumbar nada.
  const sinCuerpo = await pedir('/auth/register', { method: 'POST' })
  verificar(sinCuerpo.status === 400, 'registro sin cuerpo responde 400')
  const jsonRoto = await pedir('/auth/login', { method: 'POST', body: '{"identifier":' })
  verificar(jsonRoto.status >= 400 && jsonRoto.status < 500, 'JSON malformado responde 4xx, no 500', `status ${jsonRoto.status}`)

  // --- Los errores no filtran detalles internos ---
  const noExiste = await pedir('/cajero/codigo/GCC-9999-ZZZZZZ', { headers: conToken(tAv0) })
  verificar(
    !/prisma|sql|select |mysql|at Object|node_modules/i.test(noExiste.texto),
    'los mensajes de error no filtran consultas, rutas de archivos ni el nombre del ORM',
  )

  return cerrar()
}

main().then((ok) => process.exit(ok ? 0 : 1))
