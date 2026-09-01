import { useState } from 'react'
import { CircleCheck, Copy, KeyRound, Loader2, ShieldCheck, TriangleAlert, Ban } from 'lucide-react'
import type { AdminUsuarioRow } from '@/shared/api/types'
import Paginacion from '@/shared/components/Paginacion'
import { usePaginacion } from '@/shared/hooks/usePaginacion'
import type { TemporalPassword } from '../admin.types'
import AdminError from '../components/AdminError'
import AdminLoading from '../components/AdminLoading'
import PresenciaBadge from '../components/PresenciaBadge'
import { formatDesdeAhora } from '../utils/adminFormatters'

interface Props {
  usuarios: AdminUsuarioRow[] | null
  error: string | null
  temporal: TemporalPassword | null
  reseteando: number | null
  /** Segundos de inactividad tras los que el servidor da a alguien por ausente. */
  ventanaEnLinea: number | null
  onRestablecer: (usuario: AdminUsuarioRow) => Promise<void>
  onClearTemporal: () => void
}

// Clave con la que se agrupa a quien no pertenece a ningún casino (el admin).
const SIN_SEDE = '__sin_sede__'

// Los tres casinos, en el orden en que se quieren ver, con el nombre corto que
// se usa como título del grupo.
//
// POR QUÉ EL ORDEN VIVE AQUÍ Y NO SALE DE LA BASE
//
// La tabla `sedes` tiene una columna `orden`, pero hoy pone Ventura Plaza de
// primera y ese orden manda en otras pantallas (el select del cajero). Este
// panel se pide expresamente con Avenida 0 al frente, que además es donde está
// la mayor parte del personal. Cambiar `orden` en la base para conseguirlo
// habría reordenado esas otras pantallas de rebote.
//
// Se agrupa por `clave` y no por el nombre comercial: la clave es estable, así
// que renombrar un casino no parte su grupo en dos.
const ORDEN_SEDES: { clave: string; titulo: string }[] = [
  { clave: 'avenida-0', titulo: 'Avenida 0' },
  { clave: 'av-5', titulo: 'Avenida 5' },
  { clave: 'ventura-plaza', titulo: 'Ventura Plaza' },
  { clave: SIN_SEDE, titulo: 'Administración' },
]

function ordenDeGrupo(clave: string): number {
  const indice = ORDEN_SEDES.findIndex((s) => s.clave === clave)
  // Una sede que no esté en la lista va al final en vez de desaparecer: si
  // mañana abren un cuarto casino, su personal se sigue viendo.
  return indice === -1 ? ORDEN_SEDES.length : indice
}

// A qué grupo pertenece una cuenta.
//
// `sedeClave` es opcional porque puede faltar si responde una API anterior; en
// ese caso se cae al nombre de la sede, que es lo único disponible. Sin este
// respaldo, TODAS las cajeras aparecerían bajo "Administración".
function claveDeGrupo(usuario: AdminUsuarioRow): string {
  if (usuario.sedeClave !== undefined) return usuario.sedeClave ?? SIN_SEDE
  return usuario.sede ?? SIN_SEDE
}

function tituloDeGrupo(clave: string, usuario: AdminUsuarioRow): string {
  return ORDEN_SEDES.find((s) => s.clave === clave)?.titulo ?? usuario.sede ?? 'Sin casino asignado'
}

// Iniciales para el avatar. Se toman el primer nombre y el primer apellido, no
// las dos primeras palabras: "José Alejandro Uribe" debe dar JU y no JA.
function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '??'
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase()
  return `${partes[0]![0]}${partes[partes.length - 1]![0]}`.toUpperCase()
}

// Por casino primero; dentro de cada uno, los presentes arriba y luego por
// nombre. Ordenar por grupo ANTES de paginar es lo que mantiene cada casino
// junto: si no, una página podría mezclar cuentas de los tres.
function ordenarParaMonitoreo(usuarios: AdminUsuarioRow[]): AdminUsuarioRow[] {
  return [...usuarios].sort((a, b) => {
    const grupoA = ordenDeGrupo(claveDeGrupo(a))
    const grupoB = ordenDeGrupo(claveDeGrupo(b))
    if (grupoA !== grupoB) return grupoA - grupoB
    if (!!a.enLinea !== !!b.enLinea) return a.enLinea ? -1 : 1
    return a.nombre.localeCompare(b.nombre, 'es')
  })
}

interface Grupo {
  clave: string
  titulo: string
  /** Las cuentas de este grupo que caen en la página actual. */
  visibles: AdminUsuarioRow[]
  /** Cuántas tiene el grupo en total, aunque la página muestre solo algunas. */
  total: number
  activos: number
}

function agrupar(visibles: AdminUsuarioRow[], todos: AdminUsuarioRow[]): Grupo[] {
  const grupos = new Map<string, Grupo>()

  // Los totales se cuentan sobre la lista COMPLETA: "6 cuentas · 2 activas"
  // debe seguir siendo cierto aunque la página muestre solo tres.
  for (const usuario of todos) {
    const clave = claveDeGrupo(usuario)
    const grupo = grupos.get(clave) ?? {
      clave,
      titulo: tituloDeGrupo(clave, usuario),
      visibles: [],
      total: 0,
      activos: 0,
    }
    grupo.total += 1
    if (usuario.enLinea) grupo.activos += 1
    grupos.set(clave, grupo)
  }

  for (const usuario of visibles) {
    grupos.get(claveDeGrupo(usuario))?.visibles.push(usuario)
  }

  return Array.from(grupos.values())
    .filter((grupo) => grupo.visibles.length > 0)
    .sort((a, b) => ordenDeGrupo(a.clave) - ordenDeGrupo(b.clave))
}

// Por qué esta cuenta no está, dicho con precisión.
//
// Distinguir "cerró sesión" de "dejó de dar señales" es el punto de tener dos
// fechas: la primera es una salida ordenada, la segunda es un navegador cerrado
// de golpe, un internet caído o un equipo apagado. Para quien vigila un turno
// no son lo mismo.
function detallePresencia(usuario: AdminUsuarioRow): string {
  if (usuario.enLinea === undefined) return 'La API todavía no informa presencia'
  if (usuario.enLinea) return 'Con sesión abierta y el panel a la vista'
  if (!usuario.ultimaActividad) return 'Nunca ha iniciado sesión'

  return cerroSesion(usuario)
    ? `Cerró sesión ${formatDesdeAhora(usuario.sesionCerradaEn)}`
    : `Sin señal desde ${formatDesdeAhora(usuario.ultimaActividad)}`
}

// La salida cuenta solo si ocurrió DESPUÉS de la última actividad. Si volvió a
// entrar luego, la actividad nueva manda y la salida vieja ya no dice nada.
function cerroSesion(usuario: AdminUsuarioRow): boolean {
  if (!usuario.sesionCerradaEn || !usuario.ultimaActividad) return false
  return new Date(usuario.sesionCerradaEn) >= new Date(usuario.ultimaActividad)
}

// Texto corto que acompaña a la insignia cuando la cuenta no está.
function resumenAusencia(usuario: AdminUsuarioRow): string {
  if (!usuario.ultimaActividad) return 'nunca ha entrado'
  if (cerroSesion(usuario)) return `salió ${formatDesdeAhora(usuario.sesionCerradaEn)}`
  return formatDesdeAhora(usuario.ultimaActividad)
}

export default function PersonalSection({
  usuarios,
  error,
  temporal,
  reseteando,
  ventanaEnLinea,
  onRestablecer,
  onClearTemporal,
}: Props) {
  const [copiado, setCopiado] = useState(false)

  const clearTemporal = () => {
    onClearTemporal()
    setCopiado(false)
  }

  const ordenados = usuarios ? ordenarParaMonitoreo(usuarios) : null
  const paginacion = usePaginacion(ordenados, 'admin.personal')
  const grupos = ordenados ? agrupar(paginacion.visibles, ordenados) : []

  // `enLinea` puede llegar undefined si la API todavía no tiene presencia; en
  // ese caso no se cuenta a nadie como presente y el resumen se calla.
  const conPresencia = ordenados?.some((u) => u.enLinea !== undefined) ?? false
  const activos = ordenados?.filter((u) => u.enLinea).length ?? 0
  const minutosVentana = ventanaEnLinea ? Math.round(ventanaEnLinea / 60) : null

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Personal
          </h2>
          <p className="text-sm text-[#9A7B50] mt-1">Cuentas con acceso al sistema, por casino</p>
        </div>

        {/* Resumen de turno: cuántos están dentro ahora mismo, en todo el
            sistema. Es el dato que se busca al abrir esta sección. */}
        {ordenados && conPresencia && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 px-4 py-2.5">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              {activos > 0 && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-70 animate-ping" />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: activos > 0 ? '#22c55e' : '#6B5D3F' }}
              />
            </span>
            <p className="text-xs text-[#C4A97A]">
              <span className="font-bold text-[#F5E6C8]">{activos}</span> {activos === 1 ? 'activo' : 'activos'}
              <span className="text-[#6B5D3F]"> de {ordenados.length}</span>
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/6 p-4 mb-6 flex gap-3">
        <KeyRound size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#C4A97A] leading-relaxed space-y-1.5">
          <p>
            Los correos del personal son solo usuarios de acceso: el dominio no recibe mensajes, así que no hay
            recuperación por correo. Si alguien olvida su contraseña, genérale una temporal aquí y entrégasela en
            persona. El sistema la obliga a cambiarla al entrar.
          </p>
          {conPresencia && (
            <p className="text-[#9A7B50]">
              <span className="text-[#C4A97A] font-semibold">Activo</span> significa que la cuenta dio señales de
              vida{minutosVentana ? ` en los últimos ${minutosVentana} min` : ' hace poco'} — sesión abierta y panel
              a la vista. Cuando no está, se dice si <span className="text-[#C4A97A]">cerró sesión</span> o si
              simplemente <span className="text-[#C4A97A]">dejó de dar señales</span>: lo segundo es un navegador
              cerrado de golpe, un internet caído o un equipo apagado, y tarda esos minutos en caer solo.
            </p>
          )}
        </div>
      </div>

      {temporal && (
        <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/8 p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <CircleCheck size={18} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-[#F5E6C8] font-semibold">Contraseña temporal de {temporal.nombre}</p>
              <p className="text-xs text-[#9A7B50] mt-0.5 break-words">{temporal.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <code className="px-4 py-2.5 rounded-xl bg-[#0a0805] border border-[#D4AF37]/25 text-[#D4AF37] text-lg font-bold tracking-widest">
              {temporal.clave}
            </code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(temporal.clave)
                  .then(() => setCopiado(true))
                  .catch(() => {})
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#9A7B50] border border-[#D4AF37]/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/45 transition-all"
            >
              <Copy size={14} /> {copiado ? 'Copiada' : 'Copiar'}
            </button>
          </div>

          <p className="text-xs text-[#9A7B50] leading-relaxed mb-3 inline-flex items-start gap-2">
            <TriangleAlert size={14} className="text-[#eab308] flex-shrink-0 mt-0.5" />
            Anótala o entrégala ahora: no se puede volver a consultar. Si se pierde, genera otra.
          </p>

          <button
            type="button"
            onClick={clearTemporal}
            className="text-xs text-[#6B5D3F] hover:text-[#C4A97A] transition-colors underline"
          >
            Ya la entregué, ocultar
          </button>
        </div>
      )}

      {error && <AdminError message={error} />}
      {!usuarios && !error && <AdminLoading label="Cargando personal..." />}

      {/*
        UN BLOQUE POR CASINO

        Las tarjetas siguen siendo tarjetas —es lo que permitió quitar la barra
        de desplazamiento horizontal— pero ahora van repartidas bajo el título
        de su casino, que es como se piensa el personal: por turno y por sede.

        Los grupos se calculan sobre la página actual, así que el tope de 20 se
        respeta igual; como el orden agrupa antes de paginar, un casino nunca
        aparece partido en dos sitios de la misma página.
      */}
      {grupos.map((grupo) => (
        <section key={grupo.clave} className="mb-8 last:mb-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3 pb-2 border-b border-[#D4AF37]/12">
            <h3
              className="text-sm font-black text-[#D4AF37] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}
            >
              {grupo.titulo}
            </h3>
            <p className="text-xs text-[#6B5D3F]">
              {grupo.total} {grupo.total === 1 ? 'cuenta' : 'cuentas'}
              {conPresencia && (
                <>
                  {' · '}
                  <span style={{ color: grupo.activos > 0 ? '#22c55e' : '#6B5D3F' }}>
                    {grupo.activos} {grupo.activos === 1 ? 'activa' : 'activas'}
                  </span>
                </>
              )}
              {/* Solo se aclara cuando la paginación partió el grupo, para que
                  el conteo de arriba no parezca equivocado. */}
              {grupo.visibles.length !== grupo.total && ` · mostrando ${grupo.visibles.length}`}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {grupo.visibles.map((usuario) => (
              <article
                key={usuario.id}
                className="rounded-2xl border p-4 flex flex-col gap-3 transition-colors"
                style={{
                  background: '#121009',
                  // El borde verde tenue distingue a quien está dentro sin tener
                  // que leer cada insignia una por una.
                  borderColor: usuario.enLinea ? 'rgba(34,197,94,0.28)' : 'rgba(212,175,55,0.12)',
                }}
              >
                <header className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={
                      usuario.rol === 'admin'
                        ? { background: 'linear-gradient(135deg, #D4AF37, #A0832A)', color: '#0a0805' }
                        : { background: 'rgba(212,175,55,0.1)', color: '#C4A97A', border: '1px solid rgba(212,175,55,0.2)' }
                    }
                  >
                    {iniciales(usuario.nombre)}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* `break-words` y no `truncate`: el nombre y el correo se
                        parten en varias lineas si hacen falta, pero se leen
                        completos. Recortarlos ahorraba dos pixeles y escondia el
                        usuario de acceso de una cajera, que es justo el dato que
                        se viene a buscar aqui. */}
                    <p className="text-sm font-semibold text-[#F5E6C8] break-words" title={usuario.nombre}>
                      {usuario.nombre}
                    </p>
                    <p className="text-xs text-[#9A7B50] break-words" title={usuario.email}>
                      {usuario.email}
                    </p>
                  </div>
                </header>

                <div className="flex flex-wrap items-center gap-2">
                  <PresenciaBadge enLinea={usuario.enLinea} detalle={detallePresencia(usuario)} />
                  {/* Solo se muestra cuando NO está: para quien está dentro el
                      "hace un momento" es ruido. */}
                  {usuario.enLinea === false && (
                    <span className="text-xs text-[#6B5D3F]">{resumenAusencia(usuario)}</span>
                  )}
                </div>

                {/* Ficha en dos columnas: nunca se sale del ancho de la tarjeta. */}
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs pt-1">
                  <div className="min-w-0">
                    <dt className="text-[#6B5D3F] mb-0.5">Rol</dt>
                    <dd className="text-[#C4A97A] capitalize">{usuario.rol}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[#6B5D3F] mb-0.5">Bonos entregados</dt>
                    <dd className="text-[#C4A97A]">{usuario.canjes}</dd>
                  </div>
                  <div className="min-w-0 col-span-2">
                    <dt className="text-[#6B5D3F] mb-0.5">Contraseña</dt>
                    <dd
                      className="inline-flex items-center gap-1"
                      style={{ color: usuario.debeCambiarPassword ? '#eab308' : '#22c55e' }}
                    >
                      {usuario.debeCambiarPassword ? (
                        <><TriangleAlert size={12} className="flex-shrink-0" /> Pendiente de cambio</>
                      ) : (
                        <><ShieldCheck size={12} className="flex-shrink-0" /> Propia</>
                      )}
                    </dd>
                  </div>
                </dl>

                {/* `activo` en la base significa "la cuenta está habilitada", que
                    NO es lo mismo que estar conectado. Se nombra "Deshabilitada"
                    justamente para que no se confunda con el "Activo" de arriba. */}
                {!usuario.activo && (
                  <p className="inline-flex items-center gap-1.5 text-xs text-[#ef4444]">
                    <Ban size={12} className="flex-shrink-0" /> Cuenta deshabilitada: no puede iniciar sesión
                  </p>
                )}

                <footer className="mt-auto pt-1">
                  <button
                    type="button"
                    onClick={() => void onRestablecer(usuario)}
                    disabled={reseteando === usuario.id}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#9A7B50] border border-[#D4AF37]/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/45 transition-all disabled:opacity-60"
                  >
                    {reseteando === usuario.id ? (
                      <><Loader2 size={13} className="animate-spin" /> Generando...</>
                    ) : (
                      <><KeyRound size={13} /> Restablecer clave</>
                    )}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      ))}

      <Paginacion
        pagina={paginacion.pagina}
        totalPaginas={paginacion.totalPaginas}
        total={paginacion.total}
        desde={paginacion.desde}
        hasta={paginacion.hasta}
        onCambiar={paginacion.setPagina}
        etiqueta="cuentas"
      />

      {ordenados && ordenados.length === 0 && (
        <div
          className="rounded-2xl border border-[#D4AF37]/12 px-4 py-10 text-center text-[#6B5D3F] text-sm"
          style={{ background: '#121009' }}
        >
          No hay cuentas de personal. Créalas con <code>npm run prisma:seed-staff</code>.
        </div>
      )}
    </div>
  )
}
