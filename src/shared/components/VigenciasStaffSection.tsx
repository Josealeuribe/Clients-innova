import { ArrowRight, CalendarClock, CircleAlert, History } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import { useVigencias } from '@/shared/hooks/useVigencias'
import { useHistorialVigencias } from '@/shared/hooks/useHistorialVigencias'
import { RegistroVigencias, VigenciaResumen } from '@/shared/components/VigenciaPromocion'
import { formatVigencia } from '@/shared/utils/vigencia'
import type { CambioVigenciaRow } from '@/shared/api/types'

// La sección "Vigencias" de los paneles de personal. Es la misma para el admin y
// para la cajera a propósito: la fecha hasta la que se puede redimir un bono es
// UNA, y si cada panel la presentara a su manera acabarían diciéndole cosas
// distintas al mismo cliente según quién lo atienda.
//
// Tiene dos mitades y responden preguntas distintas:
//
//   El registro    — qué se redime hasta cuándo, HOY. Es lo que se consulta para
//                    atender a alguien en el mostrador.
//   El historial   — cómo llegó a ser esa fecha: quién la movió, cuándo y por
//                    qué. Es lo que se consulta cuando un cliente reclama que le
//                    dijeron otra cosa.

function fechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  })
}

function FilaCambio({ cambio }: { cambio: CambioVigenciaRow }) {
  // Verde si alargó el plazo, ámbar si lo acortó. Acortar es lo que puede dejar
  // a alguien sin poder redimir, así que se distingue de un vistazo.
  const color = cambio.extiende ? '#22c55e' : '#eab308'

  return (
    <div className="rounded-xl border border-[#D4AF37]/10 p-4" style={{ background: 'rgba(0,0,0,0.18)' }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-sm font-semibold text-[#F5E6C8]">{cambio.premio.nombre}</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider"
          style={{ color, background: `${color}18` }}
        >
          {cambio.extiende ? 'EXTENDIDA' : 'ACORTADA'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
        <span className="text-[#6B5D3F] line-through">{formatVigencia(cambio.anterior)}</span>
        <ArrowRight size={12} className="text-[#6B5D3F] flex-shrink-0" />
        <span className="font-semibold" style={{ color }}>
          {formatVigencia(cambio.nueva)}
        </span>
      </div>

      <p className="text-xs text-[#9A7B50] leading-relaxed mb-2">{cambio.motivo}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#6B5D3F] pt-2 border-t border-[#D4AF37]/8">
        <span>{fechaHora(cambio.creadoEn)}</span>
        <span>Por: {cambio.registradoPor}</span>
        {/* Cuántos bonos YA ENTREGADOS se movieron con el cambio. Es el dato que
            dice si la extensión alcanzó a la gente que estaba esperando o si
            solo aplicó de ahí en adelante. */}
        <span>
          {cambio.bonosAfectados === 0
            ? 'Sin bonos entregados afectados'
            : `${cambio.bonosAfectados} bono${cambio.bonosAfectados === 1 ? '' : 's'} entregado${cambio.bonosAfectados === 1 ? '' : 's'} actualizado${cambio.bonosAfectados === 1 ? '' : 's'}`}
        </span>
      </div>
    </div>
  )
}

export default function VigenciasStaffSection() {
  const { token } = useAuth()
  const { datos, error } = useVigencias()
  const { cambios, error: errorHistorial } = useHistorialVigencias(token, true)

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <CalendarClock size={22} className="text-[#D4AF37]" />
          <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Vigencias
          </h2>
        </div>
        <p className="text-sm text-[#9A7B50] mt-1">
          Hasta cuándo se redime cada premio, y el registro de cada vez que esa fecha se ha movido.
        </p>
      </div>

      <VigenciaResumen datos={datos} error={error} className="mb-6" />

      <RegistroVigencias
        datos={datos}
        error={error}
        mostrarPendientes
        titulo="Registro de vigencias"
        descripcion="Cada premio tiene su propia fecha. Esto es lo que se le debe decir a un cliente que pregunte en caja."
      />

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-1">
          <History size={18} className="text-[#D4AF37]" />
          <h3 className="font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Historial de cambios
          </h3>
        </div>
        <p className="text-xs text-[#6B5D3F] mb-4">
          Quién movió cada fecha, cuándo y por qué. Sirve para responder un reclamo de "a mí me dijeron otra fecha".
        </p>

        {errorHistorial ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/8 p-4 flex items-center gap-3">
            <CircleAlert size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{errorHistorial}</p>
          </div>
        ) : !cambios ? (
          <div className="rounded-2xl border border-[#D4AF37]/12 p-6" style={{ background: '#121009' }}>
            <p className="text-sm text-[#6B5D3F]">Cargando el historial...</p>
          </div>
        ) : cambios.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed border-[#D4AF37]/20 py-10 text-center"
            style={{ background: '#121009' }}
          >
            <History size={26} className="text-[#6B5D3F] mx-auto mb-3" />
            <p className="text-sm text-[#9A7B50]">
              La vigencia no se ha movido todavía: sigue siendo la original de la promoción.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-3">
            {cambios.map((cambio) => (
              <FilaCambio key={cambio.id} cambio={cambio} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
