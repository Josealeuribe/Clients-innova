import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export default function LoginPrimaryButton({ className = '', children, ...props }: Props) {
  return (
    <button
      {...props}
      className={`w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] disabled:opacity-60 ${className}`}
      style={{
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
        letterSpacing: '0.06em',
        ...props.style,
      }}
    >
      {children}
    </button>
  )
}
