import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Info, TriangleAlert, Wallet, X } from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import { useBloquearScroll } from '@/shared/hooks/useBloquearScroll'
import { colorDeSede, TINTA } from '../charts/paleta'
import { formatCOP, formatNumero } from '../utils/adminFormatters'
import { buildDineroPorCasino, type DineroSede } from '../utils/dineroPorCasino'

// MODAL: DINERO ENTREGADO POR CASINO
//
// POR QUÉ ES UN MODAL Y NO UNA SECCIÓN MÁS
//
// Es una consulta puntual —"¿cuánto hemos pagado?"— que se hace sobre lo que ya
// se está mirando y de la que uno sale enseguida. Como sección propia obligaría
// a perder el contexto del panel para volver después; como modal se abre encima
// y se cierra.
//
// POR QUÉ VA EN UN PORTAL A `document.body`
//
// Las dos secciones que lo abren (Vista General y Dashboard) envuelven todo en
// un div con `animation: slide-up ... forwards`. Un elemento con `transform`
// —y `forwards` deja el del último fotograma puesto para siempre— se vuelve el
// bloque contenedor de sus descendientes `position: fixed`. O sea que este
// `inset-0` NO se medía contra la pantalla sino contra la sección, que es más
// alta que el viewport: el modal quedaba anclado dentro de ella, tapado por
// debajo y sin forma de llegar al final del contenido. Sacándolo al `body` por
// un portal, `fixed` vuelve a significar "la pantalla" pase lo que pase con los
// estilos de quien lo abre.
//
// DE DÓNDE SALEN LOS PESOS
//
// El modelo `Premio` del servidor no tiene columna de valor: el monto solo vive
// dentro del texto del nombre. La valoración es una tabla declarada en
// utils/valorPremios.ts, y los premios de cortesía NO se valorizan — se
// reportan por cantidad, aparte, en vez de entrar al total como si valieran
// cero. Ver esa tabla para el detalle.

interface Props {
  clientes: AdminClienteRow[] | null
  onCerrar: () => void
}

export default function DineroCasinosModal({ clientes, onCerrar }: Props) {
  const dinero = buildDineroPorCasino(clientes)
  const botonCerrar = useRef<HTMLButtonElement | null>(null)

  useBloquearScroll(true)

  useEffect(() => {
    // El foco entra al modal al abrirlo: sin esto queda en el botón de atrás y
    // el tabulador recorre el panel de abajo, que ya no se puede usar.
    botonCerrar.current?.focus()

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      // Cerrar tocando fuera. Se compara el objetivo con el propio fondo para
      // que un clic que empezó dentro de la tarjeta no cierre el modal.
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar()
      }}
    >
      {/* La tarjeta nunca pasa del alto de la pantalla y el que scrollea es su
          cuerpo, no la página: así el título y la X siguen a la vista aunque el
          desglose sea largo, y en un portátil de 768px se llega hasta la última
          nota. `dvh` y no `vh` porque en el celular la barra del navegador
          aparece y desaparece, y con `vh` el final del modal queda debajo. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-dinero-casinos"
        className="relative flex flex-col w-full max-w-3xl max-h-full rounded-3xl border border-[#D4AF37]/40 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1C1810 0%, #121009 100%)',
          animation: 'modal-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          boxShadow: '0 0 60px rgba(212,175,55,0.18), 0 30px 80px rgba(0,0,0,0.6)',
          maxHeight: 'calc(100dvh - 1.5rem)',
        }}
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-[#D4AF37]/10">
          <div className="min-w-0">
            <h2
              id="titulo-dinero-casinos"
              className="text-lg sm:text-xl font-black"
              style={{ fontFamily: "'Inter', sans-serif", color: TINTA.primaria }}
            >
              Dinero entregado por casino
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: TINTA.apagada }}>
              Bonos monetarios ya redimidos en caja, y lo que queda comprometido.
            </p>
          </div>
          <button
            ref={botonCerrar}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex-shrink-0 rounded-full border border-[#D4AF37]/25 p-2 text-[#9A7B50] hover:text-[#D4AF37] hover:border-[#D4AF37]/60 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* `min-h-0` es lo que deja encoger a este hijo dentro del flex y que
            el scroll sea suyo; sin eso crece hasta desbordar la tarjeta.
            `overscroll-contain` evita que al llegar al final el gesto siga
            arrastrando lo que haya detrás. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6">
          {!dinero ? (
            <p className="text-sm py-8 text-center" style={{ color: TINTA.tenue }}>
              Cargando la información de los clientes...
            </p>
          ) : (
            <Contenido dinero={dinero} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Contenido({ dinero }: { dinero: NonNullable<ReturnType<typeof buildDineroPorCasino>> }) {
  const { sedes, totales, promedioEntregado } = dinero
  const maximoEntregado = Math.max(...sedes.map((s) => s.entregado), 1)
  const sinValorizar = totales.sinValorizarEntregados + totales.sinValorizarPendientes

  return (
    <>
      {/* CIFRA PROTAGONISTA. Una sola por vista, en la misma tipografía sans
          que todo lo demás, y con dígitos proporcionales: `tabular-nums` a este
          tamaño deja los números flojos y separados. */}
      <div className="rounded-2xl border border-[#D4AF37]/20 p-5 mb-6" style={{ background: 'rgba(212,175,55,0.05)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={15} style={{ color: '#b1900f' }} />
          <p className="text-[11px] font-bold tracking-wider" style={{ color: TINTA.apagada }}>
            TOTAL ENTREGADO EN LOS 3 CASINOS
          </p>
        </div>
        {/* El tamaño se adapta al ancho: fijo en 48px, un total de ocho cifras
            se salía de la tarjeta en un celular y partía la pantalla. */}
        <p
          className="font-black leading-none break-words"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: TINTA.primaria,
            fontSize: 'clamp(28px, 8vw, 48px)',
          }}
        >
          {formatCOP(totales.entregado)}
        </p>
        <p className="text-sm mt-2" style={{ color: TINTA.apagada }}>
          {formatNumero(totales.monetariosEntregados)} bono
          {totales.monetariosEntregados === 1 ? '' : 's'} monetario
          {totales.monetariosEntregados === 1 ? '' : 's'} redimido
          {totales.monetariosEntregados === 1 ? '' : 's'}
          {promedioEntregado != null && (
            <>
              {' · '}
              {formatCOP(promedioEntregado)} en promedio por bono
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {sedes.map((fila) => (
          <FilaCasino key={fila.sede} fila={fila} maximoEntregado={maximoEntregado} />
        ))}
      </div>

      {/* Lo que falta por pagar. Va aparte de la cifra protagonista porque es
          otra cosa: dinero comprometido, no dinero que ya salió. */}
      <div className="rounded-2xl border border-[#D4AF37]/12 p-4 mb-5" style={{ background: '#121009' }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm" style={{ color: TINTA.secundaria }}>
            Comprometido y sin entregar
          </p>
          <p className="text-lg font-black tabular-nums" style={{ color: '#eab308' }}>
            {formatCOP(totales.pendiente)}
          </p>
        </div>
        <p className="text-xs mt-1" style={{ color: TINTA.tenue }}>
          {formatNumero(totales.monetariosPendientes)} bono
          {totales.monetariosPendientes === 1 ? '' : 's'} monetario
          {totales.monetariosPendientes === 1 ? '' : 's'} que el cliente todavía no ha venido a reclamar. Hasta cuándo
          puede hacerlo lo dice la sección Vigencias: cada premio tiene su propia fecha.
        </p>
      </div>

      {/* CORTESÍAS: CANTIDAD, NUNCA PESOS.
          El cartón de bingo, la entrada al evento y el premio sorpresa no
          tienen valor monetario asignado por el negocio. Meterlos al total como
          cero los haría invisibles y dejaría el conteo de bonos sin cuadrar con
          el de dinero; ponerles un precio inventado sería peor. */}
      {(totales.cortesiasEntregadas > 0 || totales.cortesiasPendientes > 0) && (
        <div className="rounded-2xl border border-[#6A00B8]/30 p-4 mb-5" style={{ background: 'rgba(106,0,184,0.08)' }}>
          <p className="text-[11px] font-bold tracking-wider mb-1" style={{ color: '#C77DFF' }}>
            CORTESÍAS · NO SE VALORIZAN EN PESOS
          </p>
          <p className="text-sm" style={{ color: TINTA.primaria }}>
            {formatNumero(totales.cortesiasEntregadas)} entregada
            {totales.cortesiasEntregadas === 1 ? '' : 's'}
            {' · '}
            {formatNumero(totales.cortesiasPendientes)} pendiente
            {totales.cortesiasPendientes === 1 ? '' : 's'}
          </p>
          <p className="text-xs mt-1" style={{ color: TINTA.tenue }}>
            Cartón de bingo, entrada a evento y premio sorpresa. Cuentan como bono entregado, pero no suman al total de
            dinero: no tienen un valor definido.
          </p>
        </div>
      )}

      {/* Si aparece un premio que no está en la tabla de valoración, se dice.
          Un premio nuevo sin valor no puede desaparecer dentro del total como
          si valiera cero: ahí el número dejaría de ser cierto en silencio. */}
      {sinValorizar > 0 && (
        <div className="rounded-2xl border border-[#ef4444]/35 p-4 mb-5" style={{ background: 'rgba(239,68,68,0.07)' }}>
          <div className="flex items-start gap-2">
            <TriangleAlert size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: TINTA.primaria }}>
                {formatNumero(sinValorizar)} bono{sinValorizar === 1 ? '' : 's'} sin valorizar
              </p>
              <p className="text-xs mt-1" style={{ color: TINTA.apagada }}>
                Hay premios que no están en la tabla de valoración, así que su monto NO está sumado arriba. Para
                incluirlos hay que agregarlos en <span className="font-mono">features/admin/utils/valorPremios.ts</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 pt-4 border-t border-[#D4AF37]/10">
        <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: TINTA.minima }} />
        <p className="text-[11px] leading-relaxed" style={{ color: TINTA.tenue }}>
          <span className="font-semibold">Las dos columnas miden cosas distintas.</span> "Entregado aquí" es el dinero
          que salió de esta caja: se cuenta por el casino donde la cajera redimió el bono. "Por entregar aquí" es el
          casino al que el premio manda al cliente, que es la única sede que tiene un bono todavía sin reclamar. Un bono
          puede redimirse en un casino distinto al asignado, así que las dos columnas de una misma fila no tienen por
          qué cuadrar entre sí.
        </p>
      </div>
    </>
  )
}

function FilaCasino({ fila, maximoEntregado }: { fila: DineroSede; maximoEntregado: number }) {
  const color = colorDeSede(fila.sede)
  const ancho = (fila.entregado / maximoEntregado) * 100

  return (
    <div className="rounded-2xl border border-[#D4AF37]/12 p-4" style={{ background: '#121009' }}>
      <div className="flex items-center gap-2 mb-3 min-w-0">
        {/* La identidad la carga esta marca; el nombre va en tinta legible y no
            en el color de la sede. */}
        <span className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background: color }} />
        <span className="text-sm font-semibold" style={{ color: TINTA.secundaria }}>
          {fila.sede}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="min-w-0">
          <p className="text-[11px] mb-1" style={{ color: TINTA.tenue }}>
            Entregado aquí
          </p>
          <p className="text-xl font-black tabular-nums leading-tight" style={{ color: TINTA.primaria }}>
            {formatCOP(fila.entregado)}
          </p>
          {/* Barra de participación: extremo del dato redondeado, base cuadrada
              contra el margen izquierdo. */}
          <div className="h-1.5 mt-2 rounded-full" style={{ background: 'rgba(212,175,55,0.10)' }}>
            <div className="h-full" style={{ width: `${ancho}%`, background: color, borderRadius: '2px 4px 4px 2px' }} />
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: TINTA.tenue }}>
            {formatNumero(fila.monetariosEntregados)} bono{fila.monetariosEntregados === 1 ? '' : 's'} monetario
            {fila.monetariosEntregados === 1 ? '' : 's'}
            {fila.cortesiasEntregadas > 0 && ` · ${formatNumero(fila.cortesiasEntregadas)} cortesía${fila.cortesiasEntregadas === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="min-w-0 sm:border-l sm:border-[#D4AF37]/10 sm:pl-4">
          <p className="text-[11px] mb-1" style={{ color: TINTA.tenue }}>
            Por entregar aquí
          </p>
          <p className="text-xl font-black tabular-nums leading-tight" style={{ color: '#eab308' }}>
            {formatCOP(fila.pendiente)}
          </p>
          <p className="text-[11px] mt-1.5" style={{ color: TINTA.tenue }}>
            {formatNumero(fila.monetariosPendientes)} bono{fila.monetariosPendientes === 1 ? '' : 's'} sin reclamar
            {fila.cortesiasPendientes > 0 && ` · ${formatNumero(fila.cortesiasPendientes)} cortesía${fila.cortesiasPendientes === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>
    </div>
  )
}
