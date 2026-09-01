import { Trophy } from 'lucide-react'

interface Props {
  prize: string | null
}

export default function PrizeBanner({ prize }: Props) {
  if (!prize) return null

  return (
    <div className="rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/6 px-4 py-3 mb-6 flex items-center gap-3">
      <Trophy size={24} className="text-[#D4AF37] flex-shrink-0" />

      <div>
        <p
          className="text-[#D4AF37] text-xs font-bold tracking-wider"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          PREMIO RESERVADO
        </p>

        <p className="text-[#C4A97A] text-sm font-semibold">
          {prize}
        </p>
      </div>
    </div>
  )
}
