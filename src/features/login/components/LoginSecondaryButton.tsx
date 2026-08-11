import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export default function LoginSecondaryButton({ children, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`w-full py-3 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all inline-flex items-center justify-center gap-1.5 ${className}`}
    >
      <ArrowLeft size={14} /> {children}
    </button>
  )
}
