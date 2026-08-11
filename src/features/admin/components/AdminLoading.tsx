import { Loader2 } from 'lucide-react'

interface Props {
  label?: string
}

export default function AdminLoading({ label = 'Cargando información...' }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 text-[#9A7B50] py-20">
      <Loader2 size={20} className="animate-spin" /> {label}
    </div>
  )
}
