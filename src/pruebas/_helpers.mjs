// Utilidades compartidas por las pruebas end-to-end de src/pruebas/.
// Son scripts de Node.js simples (sin framework de testing) que golpean el
// backend real corriendo en local — no mocks. Requieren:
//   1. El backend corriendo: cd server && npm run dev  (puerto 4000)
//   2. MySQL corriendo con las cuentas de staff sembradas (npm run prisma:seed-staff)
//
// Cada archivo de prueba se ejecuta de forma independiente:
//   node src/pruebas/01-auth.pruebas.mjs

export const BASE = 'http://localhost:4000/api'

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...(options.headers || {}) },
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

// Prefijo reconocible para poder limpiar los datos de prueba fácilmente:
//   DELETE FROM clientes WHERE email LIKE 'test-e2e-%@example.com';
export function testEmail() {
  return `test-e2e-${Math.random().toString(36).slice(2, 10)}@example.com`
}

export function testDocNum() {
  return `9${Math.floor(100000000 + Math.random() * 899999999)}`
}

export function createSuite(name) {
  let passed = 0
  let failed = 0
  console.log(`\n=== ${name} ===`)

  const assert = (condition, message) => {
    if (condition) {
      passed++
      console.log(`  ✓ ${message}`)
    } else {
      failed++
      console.error(`  ✗ ${message}`)
    }
  }

  const finish = () => {
    console.log(`--- ${name}: ${passed} pasaron, ${failed} fallaron ---`)
    if (failed > 0) process.exitCode = 1
    return failed === 0
  }

  return { assert, finish }
}

// Crea un cliente con bono pendiente ASIGNADO A LA SEDE PEDIDA.
//
// Desde que un bono solo se redime en su casino, no basta con generar un bono
// cualquiera: si sale de otra sede, la cajera de la prueba no puede canjearlo
// y el fallo no diría nada útil sobre lo que se estaba probando.
export async function registrarConBonoEn(claveSede, intentos = 40) {
  for (let i = 0; i < intentos; i++) {
    const giro = await api('/ruleta/girar-anonimo', { method: 'POST' })
    const registro = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registroValido({ email: testEmail(), docNum: testDocNum(), ticket: giro.body.ticket })),
    })
    if (registro.body?.bono?.sedeRedencion?.clave === claveSede) return registro
  }
  throw new Error(`No salió ningún premio de la sede "${claveSede}" en ${intentos} giros.`)
}

export function datoHace(anios) {
  const fecha = new Date()
  fecha.setFullYear(fecha.getFullYear() - anios)
  return fecha.toISOString().slice(0, 10)
}

export function registroValido(overrides = {}) {
  return {
    nombres: 'Prueba',
    apellidos: 'Automatizada',
    docType: 'Cédula de Ciudadanía',
    docNum: testDocNum(),
    birth: datoHace(25),
    phone: '3001234567',
    dept: 'Santander',
    city: 'Bucaramanga',
    email: testEmail(),
    pass: 'Passw0rd',
    passConfirm: 'Passw0rd',
    terminos: true,
    datos: true,
    edad: true,
    promo: true,
    comms: false,
    ...overrides,
  }
}
