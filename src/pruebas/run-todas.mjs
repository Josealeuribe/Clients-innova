// Corre las tres suites en secuencia (cada una en su propio proceso, porque
// cada suite termina con process.exit) y resume el resultado global.
// Uso: node src/pruebas/run-todas.mjs

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { api } from './_helpers.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUITES = [
  '01-auth.pruebas.mjs',
  '02-ruleta-bono.pruebas.mjs',
  '03-admin-cajero.pruebas.mjs',
  '04-un-bono-por-cliente.pruebas.mjs',
  '05-auditoria.pruebas.mjs',
  '06-vigencia-y-codigos.pruebas.mjs',
  '07-limite-giros-y-ubicaciones.pruebas.mjs',
]

async function estadoDelBackend() {
  try {
    const res = await api('/health')
    return res.status === 200 ? res.body : null
  } catch {
    return null
  }
}

async function main() {
  const salud = await estadoDelBackend()
  if (!salud) {
    console.error('✗ El backend no responde en http://localhost:4000. Corre "npm run dev" dentro de server/ antes de probar.')
    process.exit(1)
  }

  // Estas suites CREAN datos: cada corrida registra decenas de clientes con
  // correo test-e2e-*. Contra una base remota eso es sembrar basura en
  // producción — ya ocurrió una vez, con 319 clientes que hubo que borrar a
  // mano. Por eso se aborta salvo que se pida explícitamente.
  if (salud.baseRemota && process.env.PERMITIR_BASE_REMOTA !== '1') {
    console.error('')
    console.error('✗ El backend está conectado a una base de datos REMOTA.')
    console.error('  Estas pruebas crean clientes reales en la base a la que apunte el backend.')
    console.error('')
    console.error('  Revisa DATABASE_URL en server/.env y apúntalo a tu MySQL local.')
    console.error('  Si de verdad quieres correrlas contra la base remota:')
    console.error('      PERMITIR_BASE_REMOTA=1 node src/pruebas/run-todas.mjs')
    console.error('  y después limpia con:')
    console.error('      npx tsx prisma/limpiar-datos-prueba.ts --confirmar')
    console.error('')
    process.exit(1)
  }

  const resultados = []
  for (const archivo of SUITES) {
    const resultado = spawnSync('node', [join(__dirname, archivo)], { stdio: 'inherit' })
    resultados.push({ archivo, ok: resultado.status === 0 })
  }

  console.log('\n=== Resumen general ===')
  resultados.forEach((r) => console.log(`  ${r.ok ? '✓' : '✗'} ${r.archivo}`))

  const huboFallos = resultados.some((r) => !r.ok)
  process.exit(huboFallos ? 1 : 0)
}

main()
