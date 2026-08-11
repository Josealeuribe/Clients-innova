import { Building2, TriangleAlert } from 'lucide-react'

interface Props {
  sede: {
    nombre: string
    direccion: string
  }
  otroCasino?: boolean
  mostrarAdvertencia?: boolean
}

export default function SedeBonoCard({ sede, otroCasino = false, mostrarAdvertencia = false }: Props) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        otroCasino
          ? 'border-[#eab308]/40 bg-[#eab308]/8'
          : 'border-[#D4AF37]/20 bg-[#D4AF37]/6'
      }`}
    >
      <p className="text-[10px] text-[#D4AF37] font-bold tracking-wider mb-1 flex items-center gap-1.5">
        <Building2 size={12} /> CASINO ASIGNADO
      </p>
      <p className="text-sm text-[#F5E6C8]">{sede.nombre}</p>
      <p className="text-xs text-[#6B5D3F]">{sede.direccion}</p>

      {mostrarAdvertencia && otroCasino && (
        <p className="mt-2 text-xs text-red-400 flex items-start gap-1.5">
          <TriangleAlert size={12} className="flex-shrink-0 mt-0.5" />
          Este bono pertenece a otro casino y no puede redimirse aquí. Indícale al cliente que se dirija a {sede.nombre}.
        </p>
      )}
    </div>
  )
}
