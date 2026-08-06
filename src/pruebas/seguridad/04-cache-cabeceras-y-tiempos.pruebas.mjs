// Caché, cabeceras HTTP, CORS y tiempos de respuesta.
//
// El punto delicado aquí es la caché: si una respuesta con datos personales
// (el listado de clientes, la ficha de un bono) queda guardada por un proxy o
// por el navegador, la puede terminar viendo alguien más desde el mismo
// equipo — y en un casino los computadores de caja son compartidos.

import { pedir, conToken, entrar, crearSuite, CUENTAS, BASE } from './_utilidades.mjs'

const { verificar, cerrar } = crearSuite('SEG-04 · Caché, cabeceras, CORS y tiempos')

// Umbrales holgados a propósito: se busca detectar algo roto (una consulta sin
// índice, un N+1), no medir rendimiento fino.
const LIMITE_NORMAL_MS = 2000
const LIMITE_LISTADO_MS = 5000

async function main() {
  const tAdmin = await entrar(...CUENTAS.admin)
  const tCajero = await entrar(...CUENTAS.cajeroAv0)

  // --- 1. Caché en respuestas con datos personales ---
  const sensibles = [
    ['/admin/clientes', tAdmin],
    ['/admin/canjes', tAdmin],
    ['/cajero/historial', tCajero],
    ['/auth/me', tAdmin],
  ]

  for (const [ruta, token] of sensibles) {
    const res = await pedir(ruta, { headers: conToken(token) })
    const cacheControl = res.headers.get('cache-control') ?? ''
    const seGuarda = !/no-store|no-cache|private|max-age=0/i.test(cacheControl)
    verificar(
      !seGuarda,
      `${ruta} no permite que se guarde en caché`,
      `Cache-Control: "${cacheControl || '(ausente)'}"`,
    )
  }

  // --- 2. Cabeceras que no deberían salir ---
  const res = await pedir('/health')
  verificar(!res.headers.get('x-powered-by'), 'no se anuncia el framework en X-Powered-By')

  // --- 3. CORS ---
  const origenAjeno = await pedir('/ubicaciones', { headers: { Origin: 'https://sitio-malicioso.example' } })
  verificar(
    !origenAjeno.headers.get('access-control-allow-origin'),
    'un origen no autorizado no recibe cabecera Access-Control-Allow-Origin',
  )

  const origenValido = await fetch(`${BASE}/ubicaciones`, { headers: { Origin: 'http://localhost:8443' } })
  verificar(
    origenValido.headers.get('access-control-allow-origin') === 'http://localhost:8443',
    'un origen autorizado sí la recibe, y con el origen exacto (no comodín)',
  )
  verificar(
    origenValido.headers.get('access-control-allow-origin') !== '*',
    'nunca se responde con comodín: sería incompatible con credenciales',
  )

  // --- 4. Tiempos de respuesta ---
  const medidos = [
    ['/health', null, LIMITE_NORMAL_MS],
    ['/ubicaciones', null, LIMITE_LISTADO_MS],
    ['/ruleta/giros-restantes', null, LIMITE_NORMAL_MS],
    ['/admin/clientes', tAdmin, LIMITE_LISTADO_MS],
    ['/admin/canjes', tAdmin, LIMITE_LISTADO_MS],
    ['/cajero/historial', tCajero, LIMITE_LISTADO_MS],
  ]

  for (const [ruta, token, limite] of medidos) {
    const r = await pedir(ruta, token ? { headers: conToken(token) } : {})
    verificar(r.ms < limite, `${ruta} responde en menos de ${limite} ms`, `tardó ${r.ms} ms`)
  }

  // --- 5. El endpoint público más caro, bajo ráfaga ---
  // /ubicaciones devuelve ~140 municipios y lo llama cada visitante que abre
  // el registro: conviene saber que aguanta llamadas simultáneas.
  const inicio = Date.now()
  const rafaga = await Promise.all(Array.from({ length: 15 }, () => pedir('/ubicaciones')))
  const total = Date.now() - inicio
  verificar(rafaga.every((r) => r.status === 200), '15 peticiones simultáneas a /ubicaciones responden todas 200')
  verificar(total < 10000, `la ráfaga completa toma menos de 10 s`, `tomó ${total} ms`)

  // --- 6. El servidor sigue en pie después de todo ---
  const salud = await pedir('/health')
  verificar(salud.status === 200, 'el servidor sigue respondiendo al terminar las pruebas')

  return cerrar()
}

main().then((ok) => process.exit(ok ? 0 : 1))
