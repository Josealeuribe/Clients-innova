import { Crown, Ticket } from 'lucide-react'
import { PRIZES } from '@/shared/data/prizes'

const CLAVE_MAYOR = 'bono-50000'

interface Props {
  /** `mini` para el pie de página: una fila de fichas pequeñas. */
  variante?: 'normal' | 'mini'
}

// Los 3 bonos de la promoción en formato boleto pequeño. Sale de PRIZES, así
// que si el catálogo cambia, cambia en el pie de página y en todas las vistas
// informativas a la vez.
export default function PremiosResumen({ variante = 'normal' }: Props) {
  if (variante === 'mini') {
    return (
      <div className="flex flex-wrap gap-2">
        {PRIZES.map((p) => {
          const mayor = p.clave === CLAVE_MAYOR
          return (
            <span
              key={p.clave}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-bold ${
                mayor ? 'border-[#B52020]/60 text-[#F0C847]' : 'border-[#D4AF37]/30 text-[#F5E6C8]'
              }`}
              style={{ background: mayor ? 'rgba(181,32,32,0.12)' : 'rgba(212,175,55,0.06)' }}
            >
              {mayor ? <Crown size={13} className="text-[#F0C847]" /> : <Ticket size={13} className="text-[#D4AF37]" />}
              <span className="font-display">${p.amount.toLocaleString('es-CO')}</span>
            </span>
          )
        })}
      </div>
    )
  }

  return (
    // @container: se reparte en 3 columnas según el ancho del panel que lo
    // contiene, no el de la pantalla (va en paneles angostos y anchos).
    <div className="@container">
    <div className="grid gap-3 @xl:grid-cols-3">
      {PRIZES.map((p) => {
        const mayor = p.clave === CLAVE_MAYOR
        return (
          <div
            key={p.clave}
            className="relative flex overflow-hidden rounded-xl"
            style={{
              boxShadow: mayor
                ? '0 0 0 1.5px rgba(181,32,32,0.6), 0 12px 28px rgba(0,0,0,0.45)'
                : '0 12px 28px rgba(0,0,0,0.45)',
            }}
          >
            <div className="min-w-0 flex-1 border border-r-0 border-[#D4AF37]/25 bg-[#15120B] px-3 py-3 @2xl:px-4">
              <p className="text-[9px] font-extrabold tracking-[0.22em] text-[#D4AF37]">
                {mayor ? 'PREMIO MAYOR' : 'BONO DE JUEGO'}
              </p>
              <p
                className="font-display text-2xl leading-tight font-black @2xl:text-3xl"
                style={{
                  background: 'linear-gradient(180deg, #F0C847 0%, #D4AF37 55%, #A0832A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ${p.amount.toLocaleString('es-CO')}
              </p>
            </div>
            <div
              className="flex w-10 flex-shrink-0 items-center justify-center border-l-2 border-dashed border-[#0a0805]/40"
              style={{ background: 'linear-gradient(160deg, #F7DF95, #D4AF37 60%, #B98E2B)' }}
            >
              {mayor ? <Crown size={18} className="text-[#1a1408]" /> : <Ticket size={18} className="text-[#1a1408]" />}
            </div>
          </div>
        )
      })}
    </div>
    </div>
  )
}
