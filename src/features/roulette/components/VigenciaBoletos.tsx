import { CalendarDays, CircleAlert, Clock, Crown, Timer } from 'lucide-react'
import fichardoBilletes from '@/shared/assets/images/fichardo-billetes.png'
import type { VigenciaPremio, VigenciasResponse } from '@/shared/api/types'
import { PRIZES } from '@/shared/data/prizes'
import { colorVigencia, formatVigencia, formatVigenciaCorta, textoRestante } from '@/shared/utils/vigencia'

// "HASTA CUÁNDO PUEDES REDIMIR" EN FORMA DE BOLETOS (noviembre de 2026)
//
// En la tragamonedas el registro de vigencias se muestra como boletos: uno por
// bono, con su monto, la combinación que lo entrega y su fecha límite, y el
// talón dorado con Fichardo. La tabla anterior (RegistroVigencias) sigue en
// uso en los paneles de cliente, caja y administración.

const COMBINACION: Record<string, string> = {
  'bono-10000': '🍒🍒🍒',
  'bono-20000': '🔔🔔🔔',
  'bono-50000': '777',
}

// Fondo del recuadro que contiene los boletos: las muescas usan este color
// para verse troqueladas.
const FONDO = '#121009'

// El premio mayor va abajo, centrado y resaltado (igual que en PrizesSection).
const CLAVE_MAYOR = 'bono-50000'

const pesos = (valor: number) => `$${valor.toLocaleString('es-CO')}`

interface Props {
  datos: VigenciasResponse | null
  error?: string | null
  /** Se resalta el boleto del bono que el visitante ya ganó. */
  claveDestacada?: string | null
}

export default function VigenciaBoletos({ datos, error, claveDestacada = null }: Props) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/15 p-4 sm:p-5" style={{ background: FONDO }}>
      <div className="mb-3">
        <h3 className="font-display text-lg font-black leading-tight text-[#F5E6C8]">Hasta cuándo puedes redimir</h3>
        <p className="mt-1 text-xs text-[#6B5D3F]">Cada bono tiene su propia fecha límite.</p>
      </div>

      {error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 p-3">
          <CircleAlert size={16} className="flex-shrink-0 text-red-400" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      ) : !datos ? (
        <p className="py-6 text-center text-xs text-[#6B5D3F]">Consultando la vigencia...</p>
      ) : datos.vigencias.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#9A7B50]">No hay premios activos en la promoción.</p>
      ) : (
        // Mismo orden que la sección de premios de Gira y Gana: dos boletos
        // arriba y el premio mayor abajo, centrado y con su distintivo. Cada
        // boleto conserva el tamaño compacto (media columna en escritorio).
        <>
          <div className="grid gap-3 md:grid-cols-2 md:gap-5">
            {datos.vigencias
              .filter((v) => v.clave !== CLAVE_MAYOR)
              .map((vigencia) => (
                <BoletoVigencia
                  key={vigencia.clave}
                  vigencia={vigencia}
                  destacado={vigencia.clave === claveDestacada}
                />
              ))}
          </div>
          {datos.vigencias
            .filter((v) => v.clave === CLAVE_MAYOR)
            .map((vigencia) => (
              <div key={vigencia.clave} className="relative mx-auto mt-7 w-full md:w-[calc(50%-0.625rem)]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-3 rounded-[28px] blur-xl"
                  style={{
                    background:
                      'radial-gradient(65% 65% at 50% 50%, rgba(240,200,71,0.35), rgba(181,32,32,0.15) 60%, transparent 85%)',
                  }}
                />
                <span
                  className="absolute -top-3 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-[#F0C847]/70 px-3 py-0.5 text-[9px] font-black tracking-[0.2em] text-[#1a1408] shadow-[0_4px_12px_rgba(212,175,55,0.4)]"
                  style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37)' }}
                >
                  <Crown size={11} />
                  EL PREMIO MAYOR
                  <Crown size={11} />
                </span>
                <BoletoVigencia vigencia={vigencia} destacado={vigencia.clave === claveDestacada} />
              </div>
            ))}
        </>
      )}

      {datos && (
        <>
          <p className="mt-3 text-[10.5px] leading-relaxed text-[#9A8B6E]">
            Solo se redimen en sede, hasta su fecha. Mientras tanto el bono queda reservado a tu nombre; pasada esa
            fecha, se anula automáticamente.
          </p>
          <p className="mt-1 text-[10px] text-[#4A3D28]">
            Consultado el {formatVigenciaCorta(datos.consultadoEn)} · fechas en hora de Colombia · un bono por persona.
          </p>
        </>
      )}
    </div>
  )
}

function BoletoVigencia({ vigencia, destacado }: { vigencia: VigenciaPremio; destacado: boolean }) {
  const premio = PRIZES.find((p) => p.clave === vigencia.clave)
  const mayor = vigencia.clave === 'bono-50000'
  const color = colorVigencia(vigencia)
  const combinacion = COMBINACION[vigencia.clave]
  const fecha = formatVigencia(vigencia.vigenciaHasta)

  return (
    <article
      className="relative flex rounded-2xl"
      style={{
        filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))',
        boxShadow: destacado ? '0 0 0 1.5px rgba(240,200,71,0.8), 0 0 16px rgba(240,200,71,0.25)' : undefined,
      }}
    >
      {/* ---------- Cuerpo ---------- */}
      <div
        className="min-w-0 flex-1 rounded-l-2xl p-1.5"
        style={{
          backgroundColor: '#15120B',
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 7px), radial-gradient(120% 120% at 0% 0%, rgba(212,175,55,0.07), transparent 60%)',
        }}
      >
        <div className="h-full rounded-xl border border-dashed border-[#D4AF37]/25 px-3 py-2 sm:px-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1 whitespace-nowrap text-[9px] font-extrabold tracking-[0.12em] text-[#D4AF37] sm:gap-1.5 sm:text-[9.5px] sm:tracking-[0.2em]">
              <Clock size={11} />
              VIGENCIA DEL BONO
            </p>
            <div className="flex items-center gap-1.5">
              {destacado && (
                <span className="rounded-full bg-[#D4AF37] px-1.5 py-px text-[8px] font-black tracking-wider text-[#1a1408]">
                  TU PREMIO
                </span>
              )}
              <span
                className="inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9px] font-extrabold whitespace-nowrap"
                style={{ color, borderColor: `${color}66`, background: `${color}14` }}
              >
                <Timer size={9} />
                {textoRestante(vigencia)}
              </span>
            </div>
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-2">
            <h4 className="font-display min-w-0 whitespace-nowrap text-[1.05rem] leading-tight font-black sm:text-xl">
              <span
                style={{
                  background: mayor
                    ? 'linear-gradient(135deg, #FFF1B8 0%, #F0C847 35%, #D4AF37 65%, #A0832A 100%)'
                    : 'linear-gradient(180deg, #F0C847 0%, #D4AF37 55%, #A0832A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {premio ? pesos(premio.amount) : vigencia.nombre}
              </span>{' '}
              <span className="text-[#F5E6C8]">+ Bono<span className="hidden min-[400px]:inline sm:inline"> de juego</span></span>
            </h4>
            {combinacion &&
              (mayor ? (
                <span className="flex-none font-serif text-[11px] font-black tracking-[0.15em] text-[#E53935]">
                  {combinacion}
                </span>
              ) : (
                <span className="flex-none text-[10px] tracking-[0.08em]">{combinacion}</span>
              ))}
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 border-t border-dashed border-[#D4AF37]/20 pt-1.5 text-[10.5px] text-[#CFC3AA] sm:text-[11px]">
            <CalendarDays size={12} className="flex-shrink-0 text-[#D4AF37]" />
            <span>
              {vigencia.vencido ? 'Venció el ' : 'Redimible hasta el '}
              <strong className="text-[#F5E6C8]">{fecha}</strong>
            </span>
          </p>
        </div>
      </div>

      {/* ---------- Muescas sobre la línea de corte ---------- */}
      <span
        aria-hidden="true"
        className="absolute -top-2 right-[64px] z-10 h-4 w-4 translate-x-1/2 rounded-full sm:right-[84px]"
        style={{ background: FONDO }}
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-2 right-[64px] z-10 h-4 w-4 translate-x-1/2 rounded-full sm:right-[84px]"
        style={{ background: FONDO }}
      />

      {/* ---------- Talón dorado ---------- */}
      <div
        className="flex w-[64px] flex-none flex-col items-center justify-center rounded-r-2xl border-l-2 border-dashed border-[#0a0805]/40 px-1.5 py-2 sm:w-[84px]"
        style={{
          background: mayor
            ? 'linear-gradient(160deg, #FFF0B0 0%, #F0C847 30%, #D4AF37 60%, #9E7A22 100%)'
            : 'linear-gradient(160deg, #F7DF95 0%, #E9C766 35%, #D4AF37 70%, #B98E2B 100%)',
        }}
      >
        <img
          src={fichardoBilletes}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="w-9 select-none drop-shadow-[0_4px_8px_rgba(60,40,0,0.4)] sm:w-11"
        />
        <p className="mt-1 text-[7px] font-extrabold tracking-[0.22em] text-[#2a1f08]">ADMITE</p>
        <p className="font-display text-base leading-none font-black text-[#1a1408]">1</p>
      </div>
    </article>
  )
}
