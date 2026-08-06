# Pruebas de seguridad

Las suites de `src/pruebas/` comprueban que las cosas **funcionan**. Estas
comprueban que **no funcionan las que no deben**: entrar sin sesión, escalar
privilegios, leer datos ajenos, colar tokens falsos.

Golpean el backend real, sin mocks.

```bash
# 1. Backend arriba
cd server && npm run dev

# 2. Las pruebas
cd Clients-innova
node src/pruebas/seguridad/run-seguridad.mjs
```

Igual que las funcionales, **se niegan a correr contra una base remota**:
registran clientes para verificar permisos. Si de verdad hace falta:

```bash
PERMITIR_BASE_REMOTA=1 node src/pruebas/seguridad/run-seguridad.mjs
cd server && npx tsx prisma/limpiar-datos-prueba.ts --confirmar
```

## Qué cubre cada suite

| Suite | Qué verifica |
|---|---|
| `01-rutas-protegidas` | Inventario completo de endpoints. Sin sesión → 401; cliente y cajero no alcanzan lo de admin; rutas inexistentes dan 404 JSON |
| `02-tokens-y-sesiones` | Firmas JWT: payload manipulado, otro secreto, `alg:none`, truncado, cabeceras mal formadas. Que el hash de contraseña nunca salga, y que el login no revele si un correo existe |
| `03-aislamiento-y-datos` | IDOR entre cajeras, canje cruzado entre casinos, inyección SQL/XSS/path traversal, validación del registro, errores que no filtran internos |
| `04-cache-cabeceras-tiempos` | Que las respuestas con datos personales no se cacheen, CORS sin comodín, sin `X-Powered-By`, tiempos de respuesta y ráfaga concurrente |
| `05-fuerza-bruta-login` | Bloqueo tras 5 intentos fallidos, que no revele qué cuentas existen, que no afecte a otras cuentas y que entrar bien reinicie el contador |

El inventario de `01` hay que **mantenerlo al día**: es lo que detecta un
endpoint nuevo que salió sin protección. Cuando agregues una ruta, agrégala
también a la lista `ENDPOINTS`.

## Hallazgos de la primera corrida

Quedaron corregidos, pero se documentan porque son errores fáciles de
reintroducir:

1. **JSON malformado devolvía 500.** `express.json()` lanza un `SyntaxError`
   ante un cuerpo inválido y el middleware de error lo trataba como fallo del
   servidor. Es culpa de quien llama: ahora devuelve 400.

2. **Las respuestas con datos personales no traían `Cache-Control`.** El
   listado de clientes, el historial de canjes y `/auth/me` podían quedar
   guardados en el navegador. En caja los equipos son compartidos entre
   turnos, así que la cajera siguiente podía verlos desde caché. Ahora la API
   responde `no-store` por defecto; `/ubicaciones` es la única excepción y lo
   declara explícitamente porque es catálogo público sin datos personales.

3. **`X-Powered-By: Express`.** No es vulnerabilidad por sí sola, pero le da
   al atacante el primer dato para buscar exploits del framework.

4. **El login no tenía tope de intentos.** Con contraseñas derivadas de la
   cédula, adivinar una cuenta de cajera era cuestión de tiempo. Ahora se
   bloquea 15 minutos tras 5 fallos, contando por identificador.

   El costo, dicho claramente: alguien que conozca el correo de una cajera
   puede dejarla sin entrar 15 minutos fallando a propósito. Se prefirió ese
   mal menor frente a que le adivinen la clave, y por eso el bloqueo es corto.
   Bloquear por IP habría sido peor: en el casino todos salen por la misma.

## Lo que estas pruebas NO cubren

Conviene tenerlo claro para no dar por cubierto lo que no lo está:

- **Rotación de contraseñas.** No existe pantalla para que una cajera cambie
  la suya, así que la clave inicial es la definitiva. Es lo que queda
  pendiente y lo que de verdad cierra el problema: el bloqueo por intentos es
  contención, no solución.
- **HTTPS y cabeceras de transporte** (HSTS, CSP). Los pone Render, no la
  aplicación; habría que verificarlos contra el dominio publicado.
- **Dependencias vulnerables.** Eso es `npm audit`, no estas suites.
