// Utilidades para las pruebas de seguridad.
//
// A diferencia de las suites funcionales (que comprueban que las cosas
// funcionan), estas comprueban que NO funcionan las que no deben: acceso sin
// sesión, escalada de privilegios, tokens manipulados, datos ajenos.
//
// Se golpea el backend real. Ver README.md de esta carpeta.

export const BASE = 'http://localhost:4000/api'

export async function pedir(path, options = {}) {
  const inicio = Date.now()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...(options.headers || {}) },
  })
  const texto = await res.text()
  let body = null
  try {
    body = JSON.parse(texto)
  } catch {
    body = texto
  }
  return {
    status: res.status,
    body,
    texto,
    headers: res.headers,
    ms: Date.now() - inicio,
  }
}

export function conToken(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function entrar(identifier, password) {
  const res = await pedir('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })
  return res.body?.token ?? null
}

export function crearSuite(nombre) {
  let pasaron = 0
  let fallaron = 0
  const fallos = []
  console.log(`\n=== ${nombre} ===`)

  const verificar = (condicion, mensaje, detalle = '') => {
    if (condicion) {
      pasaron++
      console.log(`  ✓ ${mensaje}`)
    } else {
      fallaron++
      fallos.push(mensaje)
      console.error(`  ✗ ${mensaje}${detalle ? ` — ${detalle}` : ''}`)
    }
  }

  const cerrar = () => {
    console.log(`--- ${nombre}: ${pasaron} pasaron, ${fallaron} fallaron ---`)
    if (fallaron > 0) process.exitCode = 1
    return fallaron === 0
  }

  return { verificar, cerrar }
}

// Credenciales usadas en las pruebas. Son las mismas del seed; si cambian
// allá, hay que cambiarlas aquí.
export const CUENTAS = {
  admin: ['admin@grancasino.com.co', 'AdminCucuta0508'],
  // Av. 0
  cajeroAv0: ['alisson.cespedes@grancasino.com.co', 'Alisson1091968222'],
  // Ventura Plaza
  cajeroVentura: ['katalina.soto@grancasino.com.co', 'Katalina1093788802'],
  // Av. 5
  cajeroAv5: ['yesica.moreno@grancasino.com.co', 'Yesica1090178677'],
}
