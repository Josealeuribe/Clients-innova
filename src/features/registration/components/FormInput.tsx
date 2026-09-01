import { Loader2, TriangleAlert } from 'lucide-react'

interface Props {
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
  checking?: boolean
  disabled?: boolean
}

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  checking,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border transition-all outline-none
            placeholder:text-[#4A3D28] disabled:opacity-40 disabled:cursor-not-allowed
            focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20
            ${error ? 'border-red-500/60' : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/35'}`}
        />

        {checking && (
          <Loader2
            size={14}
            className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D3F]"
          />
        )}
      </div>

      {error && (
        <span className="text-red-400 text-xs flex items-center gap-1">
          <TriangleAlert size={12} className="flex-shrink-0" />
          {error}
        </span>
      )}
    </div>
  )
}
