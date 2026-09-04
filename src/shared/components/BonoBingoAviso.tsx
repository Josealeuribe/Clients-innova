import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Bike, CalendarClock, CalendarDays, Clock, Layers, MapPin, X } from 'lucide-react'
import type { PromoBingo } from '@/shared/api/types'
import { formatVigencia } from '@/shared/utils/vigencia'
import { useBloquearScroll } from '@/shared/hooks/useBloquearScroll'
import { fechaEventoBingo, horaEventoBingo } from './BingoPromoBanner'

// EL CARTÓN TIENE DOS FECHAS, Y ESO HAY QUE EXPLICARLO
//
// El bono de bingo arrastra dos plazos distintos y confundirlos deja al cliente
// creyendo que perdió su premio:
//
//   - 5 de septiembre — el día del evento. Si va, juega el bingo.
//   - 30 de septiembre — la vigencia del bono, igual que el resto de premios.
//     Si no va al evento, el bono NO se pierde ese día: sigue vivo hasta su
//     vencimiento y se puede redimir en caja.
//
// El chip va justo debajo del de vigencia general (el verde) y con el mismo
// formato, para que se lean como lo que son: dos condiciones del mismo premio.
// Al pulsarlo abre el detalle, porque las dos opciones no caben en una línea
// sin volver a escribirlo todo de corrido.
//
// EL MODAL SE MONTA EN UN PORTAL, NO DONDE ESTA EL CHIP
//
// El chip vive dentro de `<div className="text-center mb-1 z-10">` de la
// ruleta. Esa raiz es `flex flex-col`, asi que sus hijos son FLEX ITEMS — y el
// z-index aplica a un flex item aunque no tenga `position`. Resultado: ese
// contenedor crea un contexto de apilamiento y el `z-40` del modal quedaba
// ENCERRADO dentro de el, incapaz de superar a los hermanos posteriores que
// tambien son z-10. Se veia el boton "Girar Ruleta" y la lista de premios
// pintados ENCIMA del modal. La raiz ademas tiene `overflow-hidden`, que puede
// recortar un hijo fijo.
//
// Montarlo en `document.body` lo saca de los dos problemas a la vez. Es lo que
// hace que un modal se comporte como modal desde cualquier punto del arbol.
//
// EL MODAL SIGUE EL MISMO LENGUAJE QUE LOS OTROS DE GIRA Y GANA
//
// Antes iba en morado, con el texto a la izquierda y otro marco, y se veía como
// una pieza de otra aplicación al lado del modal de premio y del de "ya
// participaste". Ahora comparte con ellos el dorado, el centrado, el mismo
// degradado de fondo, la misma sombra, la misma animación y el mismo botón de
// cerrar. El morado queda solo en el distintivo de la campaña.

interface Props {
  promo: PromoBingo | null
  /** Vigencia del cartón (ISO). Sale del catálogo, no está escrita aquí. */
  vigenciaHasta: string | null
  className?: string
}

export default function BonoBingoAviso({ promo, vigenciaHasta, className = '' }: Props) {
  const [abierto, setAbierto] = useState(false)

  // Congela la página de atrás mientras el modal está abierto. Sin esto, la
  // rueda del ratón seguía desplazando el contenido detrás del modal.
  useBloquearScroll(abierto)

  if (!promo) return null

  const fecha = fechaEventoBingo(promo.eventoEn)
  const hora = horaEventoBingo(promo.eventoEn)
  const nombreSede = promo.sede?.nombre ?? 'Casino Ventura Plaza'
  const moto = promo.premioEvento

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all hover:brightness-125 ${className}`}
        style={{ borderColor: 'rgba(106,0,184,0.55)', background: 'rgba(106,0,184,0.14)' }}
        aria-haspopup="dialog"
      >
        <Layers size={13} className="flex-shrink-0 text-[#C77DFF]" />
        <span className="text-xs text-[#C4A97A]">
          Bono <strong className="text-[#C77DFF]">Bingo Especial</strong> · {fecha}
        </span>
        <span className="text-[10px] text-[#9A7B50] underline">ver detalles</span>
      </button>

      {abierto && createPortal(
        <div
          // pt-24: el navbar es `fixed z-50` y queda por encima de cualquier
          // modal de esta vista. Se le deja su espacio para que la tarjeta no
          // pase por debajo y se lea completa.
          className="fixed inset-0 z-40 flex items-center justify-center px-4 pb-6 pt-28"
          style={{ background: 'rgba(0,0,0,0.82)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bono-bingo-titulo"
          // Cerrar al pulsar el fondo. Se comprueba que el clic sea EN el fondo
          // y no en la tarjeta: sin eso, cualquier clic dentro cerraría el modal.
          onClick={(e) => {
            if (e.target === e.currentTarget) setAbierto(false)
          }}
        >
          {/* Mismo marco que PrizeModal y YaParticipasteModal: max-w-md,
              rounded-3xl, borde dorado, degradado 145deg, misma sombra y misma
              animación de entrada. */}
          <div
            className="relative max-h-[calc(100vh-9.5rem)] w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF37]/40"
            style={{
              background: 'linear-gradient(145deg, #1C1810 0%, #121009 100%)',
              animation: 'modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
              boxShadow: '0 0 60px rgba(212,175,55,0.2), 0 30px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* EL BOTON DE CERRAR VA FUERA DEL AREA QUE SCROLLEA.
                Este modal tiene mas contenido que los otros de la vista, asi que
                su interior scrollea. Con la X dentro de ese interior (absolute
                respecto al contenedor que se desplaza), bastaba bajar un poco
                para que se fuera de pantalla y quedarse sin forma visible de
                cerrar. Ahora la X pertenece al marco, que no se mueve. */}
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar modal"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/25 text-[#9A7B50] backdrop-blur-sm transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
              style={{ background: 'rgba(18,16,9,0.75)' }}
            >
              <X size={16} />
            </button>

            {/* El contenido, que es lo unico que se desplaza. */}
            <div className="max-h-[calc(100vh-9.5rem)] overflow-y-auto p-8 text-center">
            <div className="mb-3 flex items-center justify-center">
              <Layers
                size={64}
                className="text-[#D4AF37]"
                style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.5))' }}
              />
            </div>

            <p className="mb-2 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
              BONO BINGO ESPECIAL
            </p>
            <h2
              id="bono-bingo-titulo"
              className="mb-2 text-2xl font-black leading-tight text-[#F5E6C8]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cartón para el Gran Bingo
            </h2>

            {/* EL PREMIO MAYOR — la moto. Va arriba y destacado porque es el
                gancho real del evento: el cartón no es el premio, es la entrada
                para jugarse la moto. */}
            {moto && (
              <div
                className="mx-auto mb-4 mt-3 rounded-xl border border-[#D4AF37]/35 p-4"
                style={{ background: 'rgba(212,175,55,0.10)' }}
              >
                <p className="flex items-center justify-center gap-2 text-sm font-black text-[#D4AF37]">
                  <Bike size={16} className="flex-shrink-0" />
                  {moto.gancho}
                </p>
                <p className="mt-1 text-sm font-bold text-[#F5E6C8]">{moto.nombre}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#C4A97A]">{moto.descripcion}</p>
              </div>
            )}

            <div className="mx-auto my-5 h-px w-3/4 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

            <div className="flex flex-col items-center gap-1.5 text-sm text-[#C4A97A]">
              <p className="flex items-center gap-2">
                <CalendarDays size={14} className="flex-shrink-0 text-[#D4AF37]" />
                <span className="font-semibold text-[#F5E6C8]">{fecha}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} className="flex-shrink-0 text-[#D4AF37]" />
                <span className="font-semibold text-[#F5E6C8]">{hora}</span>
                <span className="text-xs text-[#9A7B50]">hora de Colombia</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="flex-shrink-0 text-[#D4AF37]" />
                {nombreSede}
              </p>
            </div>

            <p className="mt-5 text-sm font-bold text-[#F5E6C8]">
              Tienes dos opciones con este bono
            </p>

            {/* Las dos vías, cada una con su fecha. Es el punto del modal: el
                cliente que no puede ir el 5 tiene que saber que NO pierde el
                bono ese día. */}
            <div className="mt-3 flex flex-col gap-2.5 text-left">
              <div
                className="rounded-xl border border-[#D4AF37]/30 p-3"
                style={{ background: 'rgba(212,175,55,0.08)' }}
              >
                <p className="text-sm font-semibold text-[#D4AF37]">1 · Jugar el bingo</p>
                <p className="mt-1 text-xs leading-relaxed text-[#C4A97A]">
                  Preséntate el <strong className="text-[#F5E6C8]">{fecha}</strong> a las{' '}
                  <strong className="text-[#F5E6C8]">{hora}</strong> en {nombreSede} con tu documento
                  y tu código. Cambias el bono por tu cartón, juegas el bingo y te la juegas por la
                  moto.
                </p>
              </div>

              <div
                className="rounded-xl border border-[#9A7B50]/30 p-3"
                style={{ background: 'rgba(154,123,80,0.08)' }}
              >
                <p className="flex items-center gap-1.5 text-sm font-semibold text-[#C4A97A]">
                  <CalendarClock size={14} className="flex-shrink-0" /> 2 · Dejarlo en espera
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#C4A97A]">
                  Si no puedes ir ese día,{' '}
                  <strong className="text-[#F5E6C8]">tu bono no se pierde</strong>. Sigue vigente
                  {vigenciaHasta ? (
                    <>
                      {' '}
                      hasta el{' '}
                      <strong className="text-[#D4AF37]">{formatVigencia(vigenciaHasta)}</strong>
                    </>
                  ) : (
                    ' hasta su fecha de vencimiento'
                  )}{' '}
                  y puedes redimirlo en caja dentro de ese plazo. Eso sí: la moto se juega
                  únicamente entre quienes asistan al bingo del {fecha}.
                </p>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-[#6B5D3F]">
              En los dos casos el bono se redime únicamente en {nombreSede}, presentando el
              documento del titular.
            </p>

            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="mt-5 w-full rounded-xl border border-[#D4AF37]/15 py-2.5 text-sm text-[#9A7B50] transition-all hover:border-[#D4AF37]/35 hover:text-[#C4A97A]"
            >
              Entendido
            </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
