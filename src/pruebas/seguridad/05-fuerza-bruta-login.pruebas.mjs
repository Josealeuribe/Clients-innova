// Freno de fuerza bruta sobre el login.
//
// Es la defensa que más importa hoy: las contraseñas iniciales del personal se
// derivan de la cédula, que es semipública. Sin tope de intentos, adivinar una
// cuenta de cajera es cuestión de tiempo, y con ella se marcan bonos como
// entregados.
//
// OJO: esta suite BLOQUEA las cuentas que usa. Se usan identificadores
// inventados salvo en la prueba que necesita una cuenta real, y esa se
// desbloquea al final entrando con la contraseña correcta.

import { pedir, crearSuite, CUENTAS } from './_utilidades.mjs'

const { verificar, cerrar } = crearSuite('SEG-05 · Fuerza bruta sobre el login')

const MAX_FALLOS = 5

async function intentar(identifier, password) {
  return pedir('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })
}

function correoInventado() {
  return `nadie-${Math.random().toString(36).slice(2, 10)}@ejemplo-inexistente.test`
}

async function main() {
  // 1) Los primeros intentos fallan con 401 y van avisando cuántos quedan
  const victima = correoInventado()
  for (let i = 1; i < MAX_FALLOS; i++) {
    const res = await intentar(victima, 'claveIncorrecta')
    verificar(res.status === 401, `intento ${i} de ${MAX_FALLOS} responde 401`, `respondió ${res.status}`)
    verificar(
      res.body?.intentosRestantes === MAX_FALLOS - i,
      `y avisa que quedan ${MAX_FALLOS - i} intentos`,
      `dijo ${res.body?.intentosRestantes}`,
    )
  }

  // 2) El intento que llega al tope dispara el bloqueo
  const alTope = await intentar(victima, 'claveIncorrecta')
  verificar(alTope.body?.intentosRestantes === 0, `el intento ${MAX_FALLOS} deja 0 restantes`)

  // 3) A partir de ahí, 429 — y ya ni se evalúa la contraseña
  const bloqueado = await intentar(victima, 'claveIncorrecta')
  verificar(bloqueado.status === 429, 'el siguiente intento responde 429 (bloqueado)', `respondió ${bloqueado.status}`)
  verificar(
    typeof bloqueado.body?.segundosRestantes === 'number' && bloqueado.body.segundosRestantes > 0,
    'el rechazo dice cuánto falta para poder reintentar',
  )
  verificar(/minuto/i.test(bloqueado.body?.error ?? ''), 'y el mensaje se lo explica al usuario en español')

  // 4) El bloqueo NO revela si la cuenta existe: un correo inventado se
  //    bloquea igual que uno real. Si solo se bloquearan los reales, el
  //    atacante sabría cuáles lo son.
  verificar(
    bloqueado.status === 429,
    'un correo que no existe también se bloquea: no se filtra qué cuentas son reales',
  )

  // 5) Acertar la contraseña con la cuenta bloqueada tampoco entra
  const conClaveBuena = await intentar(victima, 'Passw0rd')
  verificar(conClaveBuena.status === 429, 'estando bloqueado, ni la contraseña correcta abre la sesión')

  // 6) El bloqueo es POR IDENTIFICADOR: otra cuenta sigue funcionando. Esto es
  //    lo que evita que un atacante deje fuera a todo el personal fallando
  //    contra una sola cuenta.
  const otro = correoInventado()
  const otroIntento = await intentar(otro, 'loquesea')
  verificar(otroIntento.status === 401, 'bloquear una cuenta no afecta a las demás', `respondió ${otroIntento.status}`)

  const adminEntra = await intentar(...CUENTAS.admin)
  verificar(adminEntra.status === 200, 'el admin sigue entrando con normalidad')

  // 7) Mayúsculas y espacios no esquivan el conteo
  const conVariacion = await intentar(`  ${victima.toUpperCase()}  `, 'claveIncorrecta')
  verificar(
    conVariacion.status === 429,
    'cambiar mayúsculas o agregar espacios no reinicia el contador',
    `respondió ${conVariacion.status}`,
  )

  // 8) Entrar bien limpia el historial de fallos
  const cajera = CUENTAS.cajeroVentura
  await intentar(cajera[0], 'claveIncorrecta')
  await intentar(cajera[0], 'claveIncorrecta')
  const entraBien = await intentar(...cajera)
  verificar(entraBien.status === 200, 'tras 2 fallos, la contraseña correcta sí entra')

  const trasEntrar = await intentar(cajera[0], 'claveIncorrecta')
  verificar(
    trasEntrar.body?.intentosRestantes === MAX_FALLOS - 1,
    'y entrar bien reinicia el contador de fallos',
    `quedaban ${trasEntrar.body?.intentosRestantes}`,
  )
  // Se deja la cuenta limpia para no estorbar a las demás suites.
  await intentar(...cajera)

  return cerrar()
}

main().then((ok) => process.exit(ok ? 0 : 1))
