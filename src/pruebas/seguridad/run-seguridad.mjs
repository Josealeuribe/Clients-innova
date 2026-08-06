// Corre las suites de seguridad en secuencia.
// Uso: node src/pruebas/seguridad/run-seguridad.mjs

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pedir } from './_utilidades.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUITES = [
  '01-rutas-protegidas.pruebas.mjs',
  '02-tokens-y-sesiones.pruebas.mjs',
  '03-aislamiento-y-datos.pruebas.mjs',
  '04-cache-cabeceras-y-tiempos.pruebas.mjs',
  '05-fuerza-bruta-login.pruebas.mjs',
]

async function main() {
  let salud
  try {
    salud = await pedir('/health')
  } catch {
    console.error('✗ El backend no responde en http://localhost:4000. Corre "npm run dev" dentro de server/.')
    process.exit(1)
  }
  if (salud.status !== 200) {
    console.error('✗ El backend no responde correctamente.')
    process.exit(1)
  }

  // Las suites 01, 02 y 03 registran clientes de prueba. Contra una base
  // remota eso ensucia producción — mismo criterio que las suites funcionales.
  if (salud.body?.baseRemota && process.env.PERMITIR_BASE_REMOTA !== '1') {
    console.error('')
    console.error('✗ El backend está conectado a una base de datos REMOTA.')
    console.error('  Estas pruebas registran clientes para verificar permisos.')
    console.error('  Revisa DATABASE_URL en server/.env, o fuerza con:')
    console.error('      PERMITIR_BASE_REMOTA=1 node src/pruebas/seguridad/run-seguridad.mjs')
    console.error('  y limpia después con:')
    console.error('      cd server && npx tsx prisma/limpiar-datos-prueba.ts --confirmar')
    console.error('')
    process.exit(1)
  }

  const resultados = []
  for (const archivo of SUITES) {
    const r = spawnSync('node', [join(__dirname, archivo)], { stdio: 'inherit' })
    resultados.push({ archivo, ok: r.status === 0 })
  }

  console.log('\n=== Resumen de seguridad ===')
  for (const r of resultados) console.log(`  ${r.ok ? '✓' : '✗'} ${r.archivo}`)

  const fallaron = resultados.filter((r) => !r.ok)
  if (fallaron.length > 0) {
    console.error(`\n${fallaron.length} suite(s) con hallazgos. Revisa el detalle arriba.`)
    process.exit(1)
  }
  console.log('\nSin hallazgos.')
}

main()
