import { CircleCheck } from 'lucide-react'

interface Props {
  message: string
}

export default function CajeroSuccess({ message }: Props) {
  return (
    <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-4 mb-6 text-center flex flex-col items-center gap-2">
      <CircleCheck size={28} className="text-green-400" />
      <p className="text-sm text-green-300">{message}</p>
    </div>
  )
}
