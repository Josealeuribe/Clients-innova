import type { ReactNode } from 'react'

interface Props {
  type?: 'error' | 'notice'
  children: ReactNode
}

export default function LoginFeedback({ type = 'error', children }: Props) {
  if (type === 'notice') {
    return (
      <p className="text-[#C4A97A] text-sm text-center bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl px-4 py-3">
        {children}
      </p>
    )
  }

  return (
    <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
      {children}
    </p>
  )
}
