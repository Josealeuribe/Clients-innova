import { CalendarClock, CircleAlert, MapPin } from 'lucide-react'
import type { VigenciaPremio, VigenciasResponse } from '@/shared/api/types'
import {
  colorVigencia,
  formatVigencia,
  formatVigenciaCorta,
  textoRestante,
} from '@/shared/utils/vigencia'

// EL REGISTRO DE VIGENCIAS, EN UN SOLO COMPONENTE
//
// La misma fecha tiene que verse en cuatro sitios: la ruleta pública, el panel
// del cliente, el del cajero y el del administrador. Escribirla cuatro veces era
// garantizar que algún día dijeran cosas distintas — y la fecha hasta la que un
// cliente puede redimir su bono es exactamente el dato que no puede
// contradecirse entre pantallas.
//
// Así que vive aquí una sola vez, en dos presentaciones:
//
//   VigenciaResumen  — la línea de titular: "válido hasta el 30 de septiembre".
//   RegistroVigencias — la tabla premio por premio, porque cada premio tiene SU
//                       fecha y pueden convivir varias a la vez.

interface ResumenProps {
  datos: VigenciasResponse | null
  error?: string | null
  /** Compacto para la ruleta (un chip); normal para los paneles. */
  variante?: 'chip' | 'panel'
  className?: string
}

// Titular de la promoción. Cuando todos los premios comparten fecha (hoy es el
// caso) dice la fecha; cuando no, dice hasta cuándo queda algo vivo y remite al
// detalle, en vez de elegir una fecha arbitraria y mentir por omisión.
export function VigenciaResumen({ datos, error, variante = 'panel', className = '' }: ResumenProps) {
  // Mientras carga no se muestra un esqueleto ni un "—": una fecha a medias es
  // peor que ninguna. Tampoco se muestra el error al visitante — si la consulta
  // falla, la promoción sigue existiendo y el resto de la vista funciona.
  if (error || !datos || datos.vigencias.length === 0) return null

  const fecha = datos.vigenciaComun ?? datos.vigenciaMaxima
  if (!fecha) return null

  // El peor caso manda el color del titular: si algo ya venció o está por
  // vencer, es lo que hay que ver de lejos. Se compara por marca de tiempo y no
  // por texto para no depender del formato que mande el servidor.
  const critico = datos.vigencias.reduce((peor, actual) =>
    new Date(actual.vigenciaHasta).getTime() < new Date(peor.vigenciaHasta).getTime() ? actual : peor,
  )
  const color = colorVigencia(critico)
  const variasFechas = datos.vigenciaComun === null

  if (variante === 'chip') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${className}`}
        style={{ borderColor: `${color}55`, background: `${color}12` }}
      >
        <CalendarClock size={13} style={{ color }} className="flex-shrink-0" />
        <span className="text-xs text-[#C4A97A]">
          {variasFechas ? (
            <>
              Bonos vigentes hasta el <strong style={{ color }}>{formatVigencia(fecha)}</strong> ·
              cada premio tiene su fecha
            </>
          ) : critico.vencido ? (
            <>
              La promoción venció el <strong style={{ color }}>{formatVigencia(fecha)}</strong>
            </>
          ) : (
            <>
              Redime tu bono hasta el <strong style={{ color }}>{formatVigencia(fecha)}</strong> ·{' '}
              {textoRestante(critico).toLowerCase()}
            </>
          )}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-3 ${className}`}
      style={{ borderColor: `${color}30`, background: `${color}0D` }}
    >
      <CalendarClock size={20} style={{ color }} className="flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[#6B5D3F]">
          {variasFechas ? 'Vigencia de la promoción (varias fechas)' : 'Vigencia de la promoción'}
        </p>
        <p className="text-sm font-semibold text-[#F5E6C8]">
          {critico.vencido ? 'Venció el ' : 'Hasta el '}
          <span style={{ color }}>{formatVigencia(fecha)}</span>
          <span className="text-[#9A7B50] font-normal"> · {textoRestante(critico)}</span>
        </p>
      </div>
    </div>
  )
}

interface RegistroProps {
  datos: VigenciasResponse | null
  error?: string | null
  /**
   * Cuántos bonos siguen sin redimir por premio. Solo tiene sentido para el
   * personal: al cliente no le dice nada y al visitante menos.
   */
  mostrarPendientes?: boolean
  /** Se resalta este premio: es el que ganó el cliente que está mirando. */
  claveDestacada?: string | null
  titulo?: string
  descripcion?: string
}

// Tabla premio por premio. Es "el registro" propiamente dicho: la razón de que
// exista es que puede haber varios bonos a la vez, cada uno con su fecha, y
// todos —visitante, cliente, cajera y admin— tienen que poder ver cuál es cuál.
export function RegistroVigencias({
  datos,
  error,
  mostrarPendientes = false,
  claveDestacada = null,
  titulo = 'Vigencia por premio',
  descripcion = 'Cada premio se redime hasta su propia fecha. Esta es la lista completa de lo que está vigente.',
}: RegistroProps) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/25 bg-red-500/8 p-4 flex items-center gap-3">
        <CircleAlert size={18} className="text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300">{error}</p>
      </div>
    )
  }

  if (!datos) {
    return (
      <div className="rounded-2xl border border-[#D4AF37]/12 p-6" style={{ background: '#121009' }}>
        <p className="text-sm text-[#6B5D3F]">Consultando la vigencia...</p>
      </div>
    )
  }

  if (datos.vigencias.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D4AF37]/20 p-8 text-center" style={{ background: '#121009' }}>
        <CalendarClock size={26} className="text-[#6B5D3F] mx-auto mb-3" />
        <p className="text-sm text-[#9A7B50]">No hay premios activos en la promoción.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
      <div className="mb-4">
        <h3 className="font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          {titulo}
        </h3>
        <p className="text-xs text-[#6B5D3F] mt-1">{descripcion}</p>
      </div>

      <div className="flex flex-col gap-2">
        {datos.vigencias.map((vigencia) => (
          <FilaVigencia
            key={vigencia.clave}
            vigencia={vigencia}
            mostrarPendientes={mostrarPendientes}
            destacada={vigencia.clave === claveDestacada}
          />
        ))}
      </div>

      {/* La hora del servidor, dicha explícitamente. En los equipos de caja el
          reloj se desajusta, y quien vea "vence hoy" tiene derecho a saber
          contra qué reloj se calculó. */}
      <p className="text-[10px] text-[#4A3D28] mt-4">
        Consultado el {formatVigenciaCorta(datos.consultadoEn)} · las fechas se muestran en hora de Colombia.
      </p>
    </div>
  )
}

function FilaVigencia({
  vigencia,
  mostrarPendientes,
  destacada,
}: {
  vigencia: VigenciaPremio
  mostrarPendientes: boolean
  destacada: boolean
}) {
  const color = colorVigencia(vigencia)

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
      style={{
        borderColor: destacada ? 'rgba(212,175,55,0.45)' : 'rgba(212,175,55,0.10)',
        background: destacada ? 'rgba(212,175,55,0.08)' : 'rgba(0,0,0,0.18)',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#F5E6C8] break-words">{vigencia.nombre}</span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: vigencia.monetario ? '#D4AF37' : '#9A7B50',
              background: vigencia.monetario ? 'rgba(212,175,55,0.12)' : 'rgba(154,123,80,0.12)',
            }}
          >
            {vigencia.monetario ? 'Bono' : 'Cortesía'}
          </span>
          {destacada && (
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider">TU PREMIO</span>
          )}
        </div>

        {vigencia.sede && (
          <p className="text-xs text-[#6B5D3F] mt-1 flex items-center gap-1">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{vigencia.sede.nombre}</span>
          </p>
        )}

        {mostrarPendientes && (
          <p className="text-xs text-[#6B5D3F] mt-1">
            {vigencia.bonosPendientes === 0
              ? 'Sin bonos pendientes'
              : `${vigencia.bonosPendientes} bono${vigencia.bonosPendientes === 1 ? '' : 's'} sin redimir`}
          </p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold" style={{ color }}>
          {formatVigencia(vigencia.vigenciaHasta)}
        </p>
        <p className="text-xs" style={{ color: `${color}CC` }}>
          {textoRestante(vigencia)}
        </p>
      </div>
    </div>
  )
}
