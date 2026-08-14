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

// Iniciales para el avatar. Se toman el primer nombre y el primer apellido, no
// las dos primeras palabras: "José Alejandro Uribe" debe dar JU y no JA.
function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '??'
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase()
  return `${partes[0]![0]}${partes[partes.length - 1]![0]}`.toUpperCase()
}

// Presentes primero, y dentro de cada grupo los admin antes que las cajeras.
//
// El orden lo decide la vista y no el backend porque depende de la presencia,
// que cambia cada pocos segundos: reordenar en el servidor obligaría a rehacer
// la consulta por algo puramente visual.
function ordenarParaMonitoreo(usuarios: AdminUsuarioRow[]): AdminUsuarioRow[] {
  return [...usuarios].sort((a, b) => {
    if (!!a.enLinea !== !!b.enLinea) return a.enLinea ? -1 : 1
    if (a.rol !== b.rol) return a.rol === 'admin' ? -1 : 1
    return a.nombre.localeCompare(b.nombre, 'es')
  })
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
          <p className="text-sm text-[#9A7B50] mt-1">Cuentas con acceso al sistema y su estado</p>
        </div>

        {/* Resumen de turno: cuántos están dentro ahora mismo. Es el dato que se
            busca al abrir esta sección para monitorear. */}
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
              a la vista. Si alguien cierra el navegador de golpe o se queda sin internet, nadie alcanza a avisar y
              su estado tarda esos minutos en caer solo.
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
              <p className="text-xs text-[#9A7B50] mt-0.5 truncate">{temporal.email}</p>
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
        TARJETAS Y NO TABLA, PARA QUITAR LA BARRA DE DESPLAZAMIENTO LATERAL

        Antes esto era una tabla de siete columnas con `min-w-[760px]` dentro de
        un `overflow-x-auto`. Con el sidebar de 240 px comiendo ancho, en
        cualquier portátil la tabla no cabía y aparecía la barra horizontal:
        había que arrastrar para ver el botón de restablecer, y en celular la
        vista era inservible. Agregar el estado de presencia como octava columna
        solo lo habría empeorado.

        Una rejilla de tarjetas no tiene ancho mínimo que romper: reflowea a una
        columna cuando hace falta y NUNCA desborda. La barra lateral no se oculta
        con CSS — se elimina la causa, que era el ancho fijo.
      */}
      {ordenados && ordenados.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* El resumen de arriba cuenta sobre la lista COMPLETA, no sobre la
              página: "3 activos de 15" seguiría siendo cierto aunque solo se
              estén viendo veinte tarjetas. */}
          {paginacion.visibles.map((usuario) => (
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
                  {/* `truncate` + `min-w-0` es lo que impide que un nombre o un
                      correo largo estire la tarjeta y devuelva el desborde
                      horizontal que se acaba de quitar. */}
                  <p className="text-sm font-semibold text-[#F5E6C8] truncate" title={usuario.nombre}>
                    {usuario.nombre}
                  </p>
                  <p className="text-xs text-[#9A7B50] truncate" title={usuario.email}>
                    {usuario.email}
                  </p>
                </div>
              </header>

              <div className="flex flex-wrap items-center gap-2">
                <PresenciaBadge
                  enLinea={usuario.enLinea}
                  detalle={
                    usuario.enLinea
                      ? 'Con sesión abierta y el panel a la vista'
                      : `Última actividad: ${formatDesdeAhora(usuario.ultimaActividad)}`
                  }
                />
                {/* Solo se muestra cuando NO está: para quien está dentro el
                    "hace un momento" es ruido. */}
                {usuario.enLinea === false && (
                  <span className="text-xs text-[#6B5D3F]">{formatDesdeAhora(usuario.ultimaActividad)}</span>
                )}
              </div>

              {/* Ficha en dos columnas: nunca se sale del ancho de la tarjeta. */}
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs pt-1">
                <div className="min-w-0">
                  <dt className="text-[#6B5D3F] mb-0.5">Rol</dt>
                  <dd className="text-[#C4A97A] capitalize truncate">{usuario.rol}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[#6B5D3F] mb-0.5">Sede</dt>
                  <dd className="text-[#C4A97A] truncate" title={usuario.sede ?? undefined}>
                    {usuario.sede || '—'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[#6B5D3F] mb-0.5">Bonos entregados</dt>
                  <dd className="text-[#C4A97A]">{usuario.canjes}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[#6B5D3F] mb-0.5">Contraseña</dt>
                  <dd
                    className="inline-flex items-center gap-1"
                    style={{ color: usuario.debeCambiarPassword ? '#eab308' : '#22c55e' }}
                  >
                    {usuario.debeCambiarPassword ? (
                      <><TriangleAlert size={12} className="flex-shrink-0" /> Pendiente</>
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
      )}

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
