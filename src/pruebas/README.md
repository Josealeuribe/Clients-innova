# Pruebas end-to-end

Scripts de Node.js que prueban el backend real (sin mocks) recorriendo los
flujos completos de la aplicación: registro, login, ruleta, roles de
administrador/cajero y canje de bonos.

## Requisitos antes de correrlas

1. MySQL corriendo con la base de datos `casino_innova` migrada y sembrada:
   ```
   cd server
   npm run prisma:migrate
   npm run prisma:seed        # catálogo de premios
   npm run prisma:seed-staff  # cuentas admin@grancasino.com.co / cajero@grancasino.com.co
   ```
2. El backend corriendo en `http://localhost:4000`:
   ```
   cd server
   npm run dev
   ```

## Cómo correrlas

Cada archivo es independiente y se ejecuta con Node directamente (no
requieren instalar ningún framework de pruebas):

```
node src/pruebas/01-auth.pruebas.mjs
node src/pruebas/02-ruleta-bono.pruebas.mjs
node src/pruebas/03-admin-cajero.pruebas.mjs
```

O todas seguidas:

```
node src/pruebas/run-todas.mjs
```

Cada script imprime ✓/✗ por cada verificación y termina con código de
salida distinto de 0 si algo falló (útil para detectar regresiones).

## Qué cubre cada suite

- **01-auth**: registro válido, disponibilidad de correo/documento en tiempo
  real (antes y después de registrar), rechazo de datos repetidos (mismo
  correo o mismo documento), rechazo de menores de 18 años, fecha de
  nacimiento inválida, login correcto/incorrecto, `/auth/me`.
- **02-ruleta-bono**: giro anónimo sin sesión, variedad de premios del
  catálogo (incluye los bonos de $5.000/$10.000), asignación del bono exacto
  al registrar con el ticket, formato y unicidad de los códigos de canje,
  manejo de un ticket inválido/expirado (la cuenta se crea igual, sin bono),
  registro directo sin pasar por la ruleta.
- **03-admin-cajero**: login de staff por el mismo endpoint que los
  clientes, control de acceso por rol (un cliente o un cajero no pueden
  entrar al panel de admin, un cliente no puede usar el módulo de cajero),
  vista previa y confirmación de canje, que el bono **desaparezca** de la
  vista del cliente justo después de canjearse, que un código no se pueda
  canjear dos veces, y que el historial y la vista de admin reflejen el
  estado real.

## Datos de prueba

Los clientes que crean estos scripts usan correos con el prefijo
`test-e2e-` (ver `_helpers.mjs`). Para limpiarlos de la base de datos:

```sql
DELETE FROM clientes WHERE email LIKE 'test-e2e-%@example.com';
```

(El `ON DELETE CASCADE` en `bonos_ganados`/`consentimientos` se encarga del
resto.)

## Qué NO cubren (limitaciones conocidas)

Estas pruebas hablan directo con la API (`fetch`), no manejan un navegador
real — no verifican renderizado, estilos, responsive ni interacción de UI
(clics, formularios). Esa verificación se hizo manualmente durante el
desarrollo. Si más adelante se quiere automatizar también la UI, la opción
natural es Playwright (`npm init playwright@latest`), pero requiere que el
entorno donde corran las pruebas pueda lanzar un navegador real.

## ⚠️ Estas pruebas escriben en la base de datos

Cada corrida registra decenas de clientes (`test-e2e-*@example.com`) con sus
bonos y consentimientos. Contra una base remota eso es sembrar basura en
producción.

`run-todas.mjs` aborta si detecta que el backend está conectado a una base que
no sea local. Antes de correrlas, revisa `DATABASE_URL` en `server/.env`.

Para limpiar lo que dejen:

```bash
cd server
npx tsx prisma/limpiar-datos-prueba.ts              # simula
npx tsx prisma/limpiar-datos-prueba.ts --confirmar  # borra
```

Solo borra clientes que cumplan las dos condiciones a la vez (correo
`test-e2e-*` y nombre "Prueba Automatizada"). Nunca toca las cuentas de
personal ni los clientes reales.
