import { Building2 } from 'lucide-react'

interface Props {
  sede: {
    nombre: string
    direccion: string
  }
}

export default function SedeActualBanner({ sede }: Props) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/6 px-4 py-2.5">
      <Building2 size={15} className="text-[#D4AF37] flex-shrink-0" />
      <div className="min-w-0">
        <span className="text-sm text-[#F5E6C8] font-medium">{sede.nombre}</span>
        <span className="text-xs text-[#6B5D3F] ml-2">{sede.direccion}</span>
      </div>
      <span className="ml-auto text-[10px] text-[#6B5D3F] whitespace-nowrap hidden sm:block">
        Los canjes quedan a nombre de esta sede
      </span>
    </div>
  )
}
