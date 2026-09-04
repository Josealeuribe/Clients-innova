import { Bike, CalendarDays, Clock, MapPin, Mic2, PlayCircle, Ticket } from 'lucide-react'
import type { PromoBingo } from '@/shared/api/types'
import bingoImg from '@/shared/assets/images/ficahardo_crypton_115.png'

// BLOQUE PROMOCIONAL DEL BINGO — VENTURA PLAZA
//
// Se muestra en la portada (widget de Eventos), en la ruleta y en el panel del
// cliente. Es el mismo componente en las tres para que casino, fecha y hora no
// puedan decir cosas distintas según la pantalla, y para que apagar la campaña
// las apague todas.
//
// LO QUE ESTE BLOQUE NO ES: una ventana emergente. Va incrustado en el flujo de
// la página, sin cubrir nada — en la ruleta concretamente va DEBAJO de la
// rueda, para no taparla ni interceptar el clic del botón de girar.
//
// Los datos (fecha, hora, presentador, sede, reel) vienen del servidor, no
// están escritos aquí: ver server/src/config/promoBingo.ts.

const ZONA = 'America/Bogota'

// La fecha se formatea en hora de Colombia SIEMPRE, con `timeZone` explícito.
// El evento es a las 5:00 p. m. en Cúcuta; un celular con otro huso (o en
// roaming) mostraría otra hora, y ese es el dato por el que la gente decide a
// qué hora salir de su casa.
export function fechaEventoBingo(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA,
  })
}

export function horaEventoBingo(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: ZONA,
  })
}

// Un dato del evento: etiqueta arriba, valor abajo.
//
// POR QUÉ EN CAMPOS Y NO EN UN PÁRRAFO
//
// Antes los cuatro datos iban seguidos en una línea de texto y había que
// leerla entera para encontrar la hora. Aquí cada uno tiene su etiqueta y su
// sitio fijo, así que se localiza de un vistazo — que es como se lee un evento:
// buscando "¿cuándo?" y "¿dónde?", no de corrido.
function Dato({
  icono: Icono,
  etiqueta,
  valor,
  destacado = false,
}: {
  icono: typeof CalendarDays
  etiqueta: string
  valor: React.ReactNode
  destacado?: boolean
}) {
  return (
    <div
      className="rounded-xl border border-[#6A00B8]/20 px-3 py-2.5"
      style={{ background: 'rgba(0,0,0,0.22)' }}
    >
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9A7B50]">
        <Icono size={11} className="flex-shrink-0 text-[#C77DFF]" />
        {etiqueta}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${destacado ? 'text-[#D4AF37]' : 'text-[#F5E6C8]'}`}
      >
        {valor}
      </p>
    </div>
  )
}

// El reel del evento. Abre en una pestaña nueva: es un sitio externo y sacar al
// visitante de la promoción sin vuelta atrás sería perderlo.
//
// `rel="noopener noreferrer"` no es decorativo — sin `noopener`, la pestaña que
// se abre puede manipular la nuestra a través de `window.opener`.
function BotonInstagram({ url, className = '' }: { url: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0a0805] transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
    >
      <PlayCircle size={16} className="flex-shrink-0" />
      Ver el evento en Instagram
    </a>
  )
}

interface Props {
  promo: PromoBingo | null
  /**
   * `completo` para la ruleta y el widget de Eventos (imagen + campos).
   * `compacto` para el panel del cliente, donde compite con su bono y no debe
   * robarle la atención.
   */
  variante?: 'completo' | 'compacto'
  /** Muestra el botón al reel. Solo el widget de Eventos lo pide. */
  mostrarInstagram?: boolean
  className?: string
}

export default function BingoPromoBanner({
  promo,
  variante = 'completo',
  mostrarInstagram = false,
  className = '',
}: Props) {
  // Un solo punto de salida: si la campaña está apagada o todavía no respondió,
  // no se renderiza nada. Las vistas no tienen que condicionar por su cuenta.
  if (!promo) return null

  const nombreSede = promo.sede?.nombre ?? 'Casino Ventura Plaza'
  const fecha = fechaEventoBingo(promo.eventoEn)
  const hora = horaEventoBingo(promo.eventoEn)

  if (variante === 'compacto') {
    return (
      <div
        className={`rounded-2xl border border-[#6A00B8]/35 overflow-hidden ${className}`}
        style={{ background: 'linear-gradient(135deg, rgba(106,0,184,0.16), rgba(61,0,107,0.08))' }}
      >
        <div className="flex flex-col sm:flex-row">
          <img
            src={bingoImg}
            alt=""
            aria-hidden="true"
            className="h-32 w-full flex-shrink-0 object-cover sm:h-auto sm:w-40"
            loading="lazy"
          />
          <div className="min-w-0 p-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#C77DFF]">
              BINGO ESPECIAL — VENTURA PLAZA
            </p>
            <p className="mt-1 text-sm font-bold text-[#F5E6C8]">🎱 Gran Bingo Ventura Plaza</p>
            <p className="mt-1 text-xs text-[#C4A97A]">
              {fecha} · {hora} · cantado por{' '}
              <strong className="text-[#F5E6C8]">{promo.presentador}</strong>
            </p>
            {/* El gancho de la moto, corto. Es el premio mayor del evento y en
                la variante compacta no cabe la descripción completa. */}
            {promo.premioEvento && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
                <Bike size={12} className="flex-shrink-0" />
                {promo.premioEvento.gancho} {promo.premioEvento.nombre}
              </p>
            )}
            <p className="mt-1.5 text-xs text-[#9A7B50]">
              Regístrate y podrás ganar tu cartón para participar.
            </p>
            <p className="mt-1 text-[10px] text-[#6B5D3F]">Promoción exclusiva {nombreSede}.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-[#6A00B8]/40 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(106,0,184,0.22) 0%, rgba(61,0,107,0.12) 45%, rgba(18,16,9,0.92) 100%)',
      }}
      aria-labelledby="bingo-promo-titulo"
    >
      {/* Resplandor decorativo. `pointer-events-none` para que no intercepte
          ningún clic: en la ruleta este bloque convive con el botón de girar. */}
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6A00B8 0%, transparent 70%)' }}
      />

      {/* La imagen del premio, arriba y a todo el ancho. Va enmarcada (y no
          recortada como silueta) porque trae su propio fondo: presentarla como
          una foto del premio es lo que le hace justicia.

          Proporción 16/9 en vez de una altura fija: con altura fija el recorte
          le cortaba las ruedas a la moto y los pies a la mascota, que es
          justamente lo que la imagen viene a mostrar. */}
      <img
        src={bingoImg}
        alt=""
        aria-hidden="true"
        className="relative aspect-[16/9] w-full object-cover"
        loading="lazy"
      />

      <div className="relative p-5 sm:p-7">
        <span
          className="inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-[#E9D5FF]"
          style={{ background: 'rgba(106,0,184,0.35)' }}
        >
          BINGO ESPECIAL — VENTURA PLAZA
        </span>

        <h2
          id="bingo-promo-titulo"
          className="mt-3 text-2xl font-black leading-tight text-[#F5E6C8] sm:text-3xl"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          🎱 Gran Bingo Ventura Plaza
        </h2>

        {/* Los cuatro datos del evento, cada uno en su campo. En móvil van a una
            columna y en escritorio a dos: es una ficha, no un párrafo. */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Dato icono={CalendarDays} etiqueta="Fecha" valor={fecha} />
          <Dato
            icono={Clock}
            etiqueta="Hora"
            valor={
              <>
                {hora}{' '}
                <span className="text-xs font-normal text-[#9A7B50]">hora de Colombia</span>
              </>
            }
          />
          <Dato icono={Mic2} etiqueta="Bingo cantado por" valor={promo.presentador} destacado />
          <Dato icono={MapPin} etiqueta="Casino" valor={nombreSede} />
        </div>

        {/* EL PREMIO MAYOR — la moto que se juega en el bingo.
            Va destacado y antes del gancho de registro porque es la razón por la
            que alguien querría el cartón: el cartón no es el premio, es la
            entrada para jugarse la moto. */}
        {promo.premioEvento && (
          <div
            className="mt-4 rounded-xl border border-[#D4AF37]/40 p-4"
            style={{ background: 'rgba(212,175,55,0.10)' }}
          >
            <p className="flex items-center gap-2 text-sm font-black tracking-wide text-[#D4AF37]">
              <Bike size={18} className="flex-shrink-0" />
              {promo.premioEvento.gancho}
            </p>
            <p className="mt-1.5 text-lg font-black leading-tight text-[#F5E6C8]">
              {promo.premioEvento.nombre}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#C4A97A]">
              {promo.premioEvento.descripcion}
            </p>
          </div>
        )}

        <div
          className="mt-4 flex items-start gap-2 rounded-xl border border-[#D4AF37]/25 p-3"
          style={{ background: 'rgba(212,175,55,0.08)' }}
        >
          <Ticket size={16} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
          <p className="text-sm font-semibold text-[#F5E6C8]">
            Regístrate y podrás ganar tu cartón para participar.
          </p>
        </div>

        {mostrarInstagram && promo.instagramUrl && (
          <BotonInstagram url={promo.instagramUrl} className="mt-4 w-full sm:w-auto" />
        )}

        <p className="mt-3 text-xs text-[#6B5D3F]">Promoción exclusiva {nombreSede}.</p>
      </div>
    </section>
  )
}
