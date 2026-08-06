// Toda ruta protegida debe exigir sesión, y el rol correcto.
//
// Se recorre el inventario COMPLETO de endpoints en vez de probar unos
// cuantos: lo que se busca es que no exista ninguno olvidado sin proteger, y
// eso solo se comprueba enumerándolos todos.

import { pedir, conToken, entrar, crearSuite, CUENTAS } from './_utilidades.mjs'

const { verificar, cerrar } = crearSuite('SEG-01 · Rutas protegidas y control de roles')

// Inventario de la API. `acceso` dice quién DEBE poder entrar.
const ENDPOINTS = [
  // Públicos: se usan antes de que exista una cuenta.
  { metodo: 'GET', ruta: '/health', acceso: 'publico' },
  { metodo: 'GET', ruta: '/ubicaciones', acceso: 'publico' },
  { metodo: 'POST', ruta: '/ruleta/girar-anonimo', acceso: 'publico' },
  { metodo: 'GET', ruta: '/ruleta/giros-restantes', acceso: 'publico' },
  { metodo: 'GET', ruta: '/auth/disponibilidad?email=a@b.co', acceso: 'publico' },

  // Requieren sesión de cliente o de staff.
  { metodo: 'GET', ruta: '/auth/me', acceso: 'autenticado' },

  // Solo staff (admin o cajero).
  { metodo: 'GET', ruta: '/cajero/sedes', acceso: 'staff' },
  { metodo: 'GET', ruta: '/cajero/historial', acceso: 'staff' },
  { metodo: 'GET', ruta: '/cajero/cliente/123456789', acceso: 'staff' },
  { metodo: 'GET', ruta: '/cajero/codigo/GCC-2026-AAAAAA', acceso: 'staff' },
  { metodo: 'POST', ruta: '/cajero/codigo/GCC-2026-AAAAAA/canjear', acceso: 'staff' },

  // Solo admin.
  { metodo: 'GET', ruta: '/admin/clientes', acceso: 'admin' },
  { metodo: 'GET', ruta: '/admin/canjes', acceso: 'admin' },
]

async function main() {
  const tokenAdmin = await entrar(...CUENTAS.admin)
  const tokenCajero = await entrar(...CUENTAS.cajeroAv0)
  verificar(!!tokenAdmin && !!tokenCajero, 'se obtuvieron sesiones de admin y cajero para las pruebas')

  // 1) SIN SESIÓN: todo lo que no sea público debe responder 401
  for (const ep of ENDPOINTS) {
    const res = await pedir(ep.ruta, { method: ep.metodo })
    if (ep.acceso === 'publico') {
      verificar(res.status !== 401, `${ep.metodo} ${ep.ruta} es público y no exige sesión`, `status ${res.status}`)
    } else {
      verificar(
        res.status === 401,
        `${ep.metodo} ${ep.ruta} sin sesión responde 401`,
        `respondió ${res.status}`,
      )
    }
  }

  // 2) SESIÓN DE CAJERO: no debe alcanzar lo de admin
  for (const ep of ENDPOINTS.filter((e) => e.acceso === 'admin')) {
    const res = await pedir(ep.ruta, { method: ep.metodo, headers: conToken(tokenCajero) })
    verificar(res.status === 403, `un cajero NO alcanza ${ep.metodo} ${ep.ruta} (403)`, `respondió ${res.status}`)
  }

  // 3) SESIÓN DE CLIENTE: no debe alcanzar nada de staff ni de admin
  const giro = await pedir('/ruleta/girar-anonimo', { method: 'POST' })
  const registro = await pedir('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nombres: 'Prueba', apellidos: 'Automatizada', docType: 'Cédula de Ciudadanía',
      docNum: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      birth: '1995-05-05', phone: '3001234567', dept: 'Norte de Santander', city: 'Cúcuta',
      email: `test-e2e-${Math.random().toString(36).slice(2, 10)}@example.com`,
      pass: 'Passw0rd', passConfirm: 'Passw0rd',
      terminos: true, datos: true, edad: true, promo: true, comms: false,
      ticket: giro.body?.ticket,
    }),
  })
  const tokenCliente = registro.body?.token
  verificar(!!tokenCliente, 'se creó un cliente para probar escalada de privilegios')

  for (const ep of ENDPOINTS.filter((e) => e.acceso === 'staff' || e.acceso === 'admin')) {
    const res = await pedir(ep.ruta, { method: ep.metodo, headers: conToken(tokenCliente) })
    verificar(
      res.status === 403,
      `un cliente NO alcanza ${ep.metodo} ${ep.ruta} (403)`,
      `respondió ${res.status}`,
    )
  }

  // 4) Una ruta inexistente no debe filtrar nada ni caerse
  const inexistente = await pedir('/no-existe-esta-ruta')
  verificar(inexistente.status === 404, 'una ruta inexistente responde 404 limpio')
  verificar(
    typeof inexistente.body === 'object' && !!inexistente.body?.error,
    'y devuelve JSON con mensaje, no una página de error del framework',
  )

  return cerrar()
}

main().then((ok) => process.exit(ok ? 0 : 1))
