import { HeartHandshake, Phone } from 'lucide-react'
import { LINEAS_AYUDA } from '@/shared/data/ayuda'

interface Props {
  titulo?: string
  descripcion?: string
}

// "Si el juego dejó de ser un juego": las líneas de ayuda con enlace tel: para
// que en el celular baste un toque. Va en rojo casino y no en dorado a
// propósito: es el único bloque del sitio que NO es promoción.
export default function AyudaJuegoPanel({
  titulo = '¿El juego dejó de ser un juego?',
  descripcion = 'Si sientes que pierdes el control, que juegas para recuperar lo perdido o que el juego te está afectando a ti o a tu familia, no estás solo. Pedir ayuda es gratis y confidencial.',
}: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#B52020]/45 p-6 sm:p-8"
      style={{
        background:
          'radial-gradient(80% 90% at 0% 0%, rgba(181,32,32,0.22), transparent 65%), linear-gradient(145deg, #1A0F0B, #120A08)',
        boxShadow: '0 20px 44px rgba(0,0,0,0.45)',
      }}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#B52020]/60 bg-[#B52020]/15 text-[#F5E6C8]">
          <HeartHandshake size={22} />
        </span>
        <div>
          <h2 className="font-display mb-2 text-2xl font-bold text-[#F5E6C8] sm:text-3xl">{titulo}</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-[#E0CDB0]">{descripcion}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {LINEAS_AYUDA.map((linea) => (
          <a
            key={linea.nombre}
            href={`tel:${linea.tel}`}
            className={`group flex flex-col rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
              linea.principal
                ? 'border-[#F0C847]/50 bg-[#D4AF37]/10 hover:border-[#F0C847]'
                : 'border-[#D4AF37]/20 bg-black/20 hover:border-[#D4AF37]/50'
            }`}
          >
            <span className="mb-1 text-[10px] font-extrabold tracking-[0.18em] text-[#D4AF37] uppercase">{linea.nombre}</span>
            <span className="font-display mb-2 flex items-center gap-2 text-2xl font-black text-[#F5E6C8]">
              <Phone size={18} className="text-[#F0C847] transition-transform group-hover:rotate-12" />
              {linea.numero}
            </span>
            <span className="text-xs leading-relaxed text-[#C4A97A]">{linea.detalle}</span>
          </a>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[#9A7B50]">
        También puedes solicitar tu <strong className="text-[#F5E6C8]">autoexclusión</strong> en la caja de cualquiera
        de nuestras sedes: dejaremos de permitirte el ingreso a las salas de juego por el tiempo que decidas.
      </p>
    </section>
  )
}
