import { useEffect, useState } from 'react'
import { Expand, Ticket, X } from 'lucide-react'
// WebP generado desde cupones-cucuta-redimir.png (2,5 MB -> ~380 KB, misma
// resolucion). Si se reemplaza el afiche, regenerar tambien este archivo.
import cupones from '@/shared/assets/images/cupones-cucuta-redimir.webp'
import { useBloquearScroll } from '@/shared/hooks/useBloquearScroll'

// Tarjeta de "cliente frecuente" junto al premio mayor. El afiche va de fondo,
// desenfocado y oscurecido para que el texto se lea; al hacer clic se abre
// completo y nitido, que es donde de verdad se pueden leer los cupones.
export default function CuponesCard() {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Ver los cupones de cliente frecuente"
        className="group relative flex min-h-[340px] w-full flex-col justify-between overflow-hidden rounded-[22px] border border-[#D4AF37]/30 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60"
        style={{ boxShadow: '0 24px 44px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.4)' }}
      >
        {/* Afiche de fondo: se enfoca un poco al pasar el mouse, como
            invitando a abrirlo. */}
        <img
          src={cupones}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-[3px] transition-all duration-500 group-hover:scale-105 group-hover:blur-[1.5px]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,8,5,0.45) 0%, rgba(10,8,5,0.35) 30%, rgba(10,8,5,0.82) 62%, rgba(10,8,5,0.96) 100%)',
          }}
        />

        <div className="relative flex items-start justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-extrabold tracking-[0.16em] text-[#1a1408]"
            style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37)' }}
          >
            <Ticket size={12} />
            CLIENTE FRECUENTE
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#0a0805]/60 text-[#F0C847] opacity-80 transition-opacity group-hover:opacity-100">
            <Expand size={14} />
          </span>
        </div>

        <div className="relative">
          <h3 className="font-display mb-2 text-[1.7rem] leading-[1.1] font-black text-[#F5E6C8]">
            Vuélvete un{' '}
            <em
              className="not-italic"
              style={{
                background: 'linear-gradient(135deg, #F0C847, #D4AF37 55%, #A0832A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              cliente frecuente
            </em>
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-[#E8DCC4]">
            Sigue visitándonos y obtén tus cupones: bonos en créditos, bebidas, sándwich, boletas y cartones dobles de
            bingo.
          </p>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#0a0805]/50 px-4 py-2 text-xs font-bold text-[#F0C847]">
            <Ticket size={14} />
            Redime 1 cupón por día
          </span>
          <p className="text-[11px] leading-snug text-[#9A7B50]">
            Toca para ver los cupones · Más visitas, más premios. Consulta condiciones en caja.
          </p>
        </div>
      </button>

      {abierto && <VisorCupones onClose={() => setAbierto(false)} />}
    </>
  )
}

// Exportado para la vista de Premios, que muestra el mismo afiche ampliable.
export function VisorCupones({ onClose }: { onClose: () => void }) {
  useBloquearScroll(true)

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cupones de cliente frecuente"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      <div
        className="relative max-h-full w-full max-w-5xl"
        style={{ animation: 'modal-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#121009] text-[#F0C847] transition-colors hover:bg-[#1C1810]"
        >
          <X size={18} />
        </button>
        <img
          src={cupones}
          alt="Redime tus cupones y aprovecha cada beneficio: bonos de $10.000 en créditos, trae un amigo, sándwich, soda especial, limonada de coco, 5 boletas y cartón doble de bingo."
          className="max-h-[85vh] w-full rounded-2xl border border-[#D4AF37]/40 object-contain shadow-[0_0_60px_rgba(212,175,55,0.25)]"
        />
      </div>
    </div>
  )
}
