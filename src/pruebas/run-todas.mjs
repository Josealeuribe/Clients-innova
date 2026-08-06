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
]

async function backendDisponible() {
  try {
    const res = await api('/health')
    return res.status === 200
  } catch {
    return false
  }
}

async function main() {
  if (!(await backendDisponible())) {
    console.error('✗ El backend no responde en http://localhost:4000. Corre "npm run dev" dentro de server/ antes de probar.')
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
