interface Props {
  message: string
  centered?: boolean
}

export default function AdminError({ message, centered = false }: Props) {
  return (
    <p
      className={`text-red-400 text-sm bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-6 ${
        centered ? 'text-center' : ''
      }`}
    >
      {message}
    </p>
  )
}
