import type { ReactNode } from 'react'
import { CalendarDays, Coins, Crown, IdCard, MapPin, Ticket, Timer, Trophy } from 'lucide-react'
import fichardoBilletes from '@/shared/assets/images/fichardo-billetes.png'
import type { VigenciaPremio } from '@/shared/api/types'
import { formatVigencia } from '@/shared/utils/vigencia'
import type { LandingPrize } from '../services/landing.service'

interface Props {
  prize: LandingPrize
  /** Etiqueta comercial del premio ("PREMIO MAYOR"...). */
  tag?: string
  /** Vigencia de ESTE premio. Null mientras carga o si la consulta falla. */
  vigencia: VigenciaPremio | null
  /** Premio mayor: halo dorado, corona y borde sólido para distinguirlo. */
  destacado?: boolean
  onRoulette: () => void
  onComoFunciona: () => void
}

// Paleta del boleto. Fondo de la pagina detras de las muescas: tiene que
// coincidir con lo que se ve alrededor para que parezcan troqueladas.
const COLOR = {
  fondoPagina: '#0a0805',
  talon: '#15120B',
  oro: '#D4AF37',
  oroClaro: '#F0C847',
  crema: '#F5E6C8',
  texto: '#CFC3AA',
  rojo: '#B52020',
} as const

// Ancho del talon dorado. La muesca y la perforacion se posicionan con este
// mismo valor, asi que se cambia aqui y en ningun otro lado.
const ANCHO_TALON = 210

const pesos = (valor: number) => `$${valor.toLocaleString('es-CO')}`

// Barras del codigo, deterministas por premio: el mismo boleto siempre se ve
// igual entre recargas (un Math.random cambiaria en cada render).
function barras(semilla: string) {
  let h = 0
  for (const c of semilla) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return Array.from({ length: 24 }, (_, i) => {
    h = (h * 1103515245 + 12345 + i) >>> 0
    return { ancho: 1 + (h % 3), alto: h % 5 === 0 ? 100 : 78 }
  })
}

function mesYAnio(iso: string | undefined) {
  const fecha = iso ? new Date(iso) : new Date()
  return fecha
    .toLocaleDateString('es-CO', { month: 'short', year: 'numeric', timeZone: 'America/Bogota' })
    .replace('.', '')
    .replace(' de ', ' ')
    .toUpperCase()
}

export default function PrizeTicket({ prize, tag, vigencia, destacado = false, onRoulette, onComoFunciona }: Props) {
  const monto = pesos(prize.amount)

  return (
    // `@container`: el boleto decide si pone el talon al lado o debajo segun
    // SU ancho, no el de la pantalla. En la grilla de dos columnas cada boleto
    // mide la mitad, y un breakpoint de pantalla no se enteraria.
    <div className="@container relative">
      {destacado && (
        <>
          {/* Halo dorado detras del boleto: lo que lo separa a simple vista. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 rounded-[40px] blur-2xl"
            style={{
              background: 'radial-gradient(65% 65% at 50% 50%, rgba(240,200,71,0.55), rgba(181,32,32,0.25) 60%, transparent 85%)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          />
          <span
            className="absolute -top-3.5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#F0C847]/70 px-4 py-1 text-[10px] font-black tracking-[0.22em] text-[#1a1408] shadow-[0_6px_18px_rgba(212,175,55,0.45)]"
            style={{ background: `linear-gradient(135deg, ${COLOR.oroClaro}, ${COLOR.oro})` }}
          >
            <Crown size={13} />
            EL PREMIO MAYOR
            <Crown size={13} />
          </span>
        </>
      )}

      <article
        className="relative flex flex-col rounded-[18px] @md:flex-row"
        style={{
          filter: 'drop-shadow(0 20px 34px rgba(0,0,0,0.55))',
          // Premio mayor: contorno rojo casino (#B52020) a media opacidad y un
          // resplandor rojo leve. Se nota sin competir con el dorado.
          boxShadow: destacado
            ? '0 0 0 1.5px rgba(181,32,32,0.6), 0 0 18px rgba(181,32,32,0.22)'
            : undefined,
        }}
      >
        {/* ---------- Cuerpo del boleto ---------- */}
        <div
          className="relative min-w-0 flex-1 rounded-t-[18px] p-2 @md:rounded-l-[18px] @md:rounded-tr-none"
          style={{
            backgroundColor: COLOR.talon,
            backgroundImage: destacado
              ? 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 7px), radial-gradient(120% 90% at 0% 0%, rgba(240,200,71,0.16), transparent 60%), radial-gradient(90% 80% at 100% 100%, rgba(181,32,32,0.14), transparent 60%)'
              : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 7px), radial-gradient(120% 90% at 0% 0%, rgba(212,175,55,0.08), transparent 60%)',
          }}
        >
          <div
            className={`h-full rounded-[13px] border px-4 py-4 sm:px-5 @xl:px-7 @xl:py-6 ${
              destacado ? 'border-[#F0C847]/60' : 'border-dashed border-[#D4AF37]/25'
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div
                className={`flex h-8 w-8 items-center @xl:h-10 @xl:w-10 justify-center rounded-lg border ${
                  destacado ? 'border-[#F0C847]/70 bg-[#F0C847]/15' : 'border-[#D4AF37]/35 bg-[#D4AF37]/8'
                }`}
              >
                {destacado ? <Crown size={15} className="text-[#F0C847]" /> : <Trophy size={15} className="text-[#D4AF37]" />}
              </div>
              <span
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[8.5px] font-extrabold tracking-[0.14em] @xl:px-3 @xl:py-1.5 @xl:text-[10px] text-[#1a1408]"
                style={{ background: `linear-gradient(135deg, ${COLOR.oroClaro}, ${COLOR.oro})` }}
              >
                <Ticket size={10} />
                {destacado ? 'BOLETO DORADO' : 'BOLETO DE BIENVENIDA'}
              </span>
            </div>

            <p className="mb-1 flex items-center gap-1.5 text-[9.5px] font-extrabold tracking-[0.26em] @xl:mb-2 @xl:text-[11px] text-[#D4AF37]">
              <span style={{ color: COLOR.rojo }}>♦</span>
              {tag ?? 'PREMIO DE GIRA Y GANA'}
              <span style={{ color: COLOR.rojo }}>♥</span>
            </p>

            <h3
              className={`font-display leading-none font-black ${destacado ? 'text-5xl sm:text-6xl @xl:text-7xl' : 'text-[2.6rem] sm:text-5xl @xl:text-6xl'}`}
              style={{
                background: destacado
                  ? 'linear-gradient(135deg, #FFF1B8 0%, #F0C847 30%, #D4AF37 55%, #A0832A 75%, #F0C847 100%)'
                  : `linear-gradient(180deg, ${COLOR.oroClaro} 0%, ${COLOR.oro} 55%, #A0832A 100%)`,
                backgroundSize: destacado ? '200% auto' : undefined,
                animation: destacado ? 'gold-shimmer 4s linear infinite' : undefined,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {monto}
            </h3>
            <p className="font-display mt-0.5 mb-2 text-base font-bold @xl:mt-1 @xl:mb-3 @xl:text-xl" style={{ color: COLOR.crema }}>
              + Bono de juego a tu nombre
            </p>

            <p className="mb-3 text-xs leading-relaxed @xl:mb-5 @xl:text-sm" style={{ color: COLOR.texto }}>
              Gira la tragamonedas, completa tu registro y reclama tu boleto en caja en cualquiera de nuestras sedes.
            </p>

            <div className="mb-3 grid grid-cols-3 gap-2 @xl:mb-4 @xl:gap-3">
              <Dato icono={<Coins size={14} />} titulo="BONO" valor={monto} />
              <Dato icono={<IdCard size={14} />} titulo="REDENCIÓN" valor="En caja" />
              <Dato icono={<MapPin size={14} />} titulo="3 SEDES" valor="Cúcuta" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-y border-dashed border-[#D4AF37]/20 py-2.5 @xl:py-3.5">
              <p className="flex items-center gap-1.5 text-[11px] @xl:text-sm" style={{ color: COLOR.texto }}>
                <CalendarDays size={13} className="flex-shrink-0 text-[#D4AF37]" />
                {vigencia ? (
                  <span>
                    Hasta el <strong className="text-[#F0C847]">{formatVigencia(vigencia.vigenciaHasta)}</strong>
                  </span>
                ) : (
                  <span>Consulta la vigencia en Gira y Gana</span>
                )}
              </p>
              {vigencia && <EstadoCanje vigencia={vigencia} />}
            </div>

            <div className="mt-3 flex gap-2 @xl:mt-4 @xl:gap-3">
              <button
                type="button"
                onClick={onRoulette}
                className="flex-1 rounded-lg px-3 py-2.5 text-[11px] font-extrabold @xl:py-3.5 @xl:text-sm tracking-[0.06em] text-[#1a1408] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${COLOR.oroClaro}, ${COLOR.oro} 55%, #A0832A)`,
                  animation: destacado ? 'pulse-glow 2.5s ease-in-out infinite' : undefined,
                }}
              >
                ✦ GIRAR Y GANAR ✦
              </button>
              <button
                type="button"
                onClick={onComoFunciona}
                className="rounded-lg border border-[#D4AF37]/30 px-3 py-2.5 text-[11px] font-semibold @xl:px-6 @xl:py-3.5 @xl:text-sm text-[#C4A97A] transition-colors hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
              >
                Cómo funciona
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Muescas y perforación ----------
            Dos círculos del color del fondo sobre la línea de corte, como un
            boleto troquelado. Cuando el talón queda debajo, la línea es
            horizontal y no hay muescas. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 z-10 hidden @md:block"
          style={{ left: `calc(100% - ${ANCHO_TALON}px)` }}
        >
          <span className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full" style={{ background: COLOR.fondoPagina }} />
          <span className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full" style={{ background: COLOR.fondoPagina }} />
          <span className="absolute top-3 bottom-3 left-0 border-l-2 border-dashed border-[#0a0805]/50" />
        </div>

        {/* ---------- Talón dorado ---------- */}
        <div
          className="relative flex flex-row items-center justify-center gap-5 rounded-b-[18px] border-t-2 border-dashed border-[#0a0805]/40 px-4 py-3 @md:w-[210px] @md:flex-none @md:flex-col @md:gap-0 @md:rounded-r-[18px] @md:rounded-bl-none @md:border-t-0 @md:py-4"
          style={{
            background: destacado
              ? 'linear-gradient(160deg, #FFF0B0 0%, #F0C847 30%, #D4AF37 60%, #9E7A22 100%)'
              : 'linear-gradient(160deg, #F7DF95 0%, #E9C766 35%, #D4AF37 70%, #B98E2B 100%)',
          }}
        >
          <img
            src={fichardoBilletes}
            alt="Fichardo con billetes"
            decoding="async"
            className="fichardo-flota w-24 select-none @md:mb-2 @md:w-36 @xl:w-44 drop-shadow-[0_10px_16px_rgba(60,40,0,0.4)]"
          />
          {/* En el boleto angosto el talón va debajo como franja: Fichardo a
              la izquierda y esto a la derecha, en vez de apilar todo. */}
          <div className="flex flex-col items-center">
          <p className="text-[8.5px] font-extrabold tracking-[0.3em] text-[#2a1f08] @xl:text-[11px]">ADMITE</p>
          <p className="font-display text-2xl leading-tight font-black text-[#1a1408] @xl:text-4xl">1</p>
          <p className="mb-2.5 text-center text-[7.5px] @xl:mb-3 @xl:text-[9px] font-extrabold tracking-[0.16em] text-[#2a1f08]">
            UN BOLETO POR PERSONA
          </p>

          <div className="flex h-6 items-end gap-[2px] @xl:h-9" aria-hidden="true">
            {barras(prize.clave).map((b, i) => (
              <span key={i} className="bg-[#1a1408]" style={{ width: b.ancho, height: `${b.alto}%` }} />
            ))}
          </div>
          <p className="mt-1.5 text-[7.5px] @xl:text-[9px] font-extrabold tracking-[0.22em] text-[#2a1f08]">
            CÚCUTA · {mesYAnio(vigencia?.vigenciaHasta)}
          </p>
          </div>
        </div>
      </article>
    </div>
  )
}

function Dato({ icono, titulo, valor }: { icono: ReactNode; titulo: string; valor: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] px-2.5 py-2 @xl:px-3.5 @xl:py-3">
      <span className="text-[#D4AF37]">{icono}</span>
      <p className="text-[8px] font-semibold tracking-[0.12em] text-[#9A7B50] @xl:text-[10px]">{titulo}</p>
      <p className="truncate text-xs leading-tight font-bold @xl:text-sm text-[#F5E6C8]">{valor}</p>
    </div>
  )
}

// Verde mientras se puede canjear, rojo cuando la fecha ya pasó. El "vencido"
// lo decide el servidor con su reloj (ver useVigencias), no el del navegador.
function EstadoCanje({ vigencia }: { vigencia: VigenciaPremio }) {
  const abierto = !vigencia.vencido
  const dias = vigencia.diasRestantes
  const texto = !abierto
    ? 'CANJE CERRADO'
    : dias <= 0
      ? '¡CANJE ABIERTO! VENCE HOY'
      : `¡CANJE ABIERTO! ${dias === 1 ? 'QUEDA 1 DÍA' : `QUEDAN ${dias} DÍAS`}`

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8.5px] @xl:px-3 @xl:py-1.5 @xl:text-[10px] font-extrabold tracking-[0.06em]"
      style={
        abierto
          ? { color: '#4ADE80', borderColor: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.08)' }
          : { color: '#F87171', borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' }
      }
    >
      <Timer size={10} />
      {texto}
    </span>
  )
}
