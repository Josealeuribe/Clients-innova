import { TriangleAlert } from 'lucide-react'

interface Props {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder: string
  error?: string
}

export default function FormSelect({
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
  error,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl text-sm bg-[#121009] border transition-all outline-none
          focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? 'border-red-500/60' : 'border-[#D4AF37]/20'}
          ${value ? 'text-[#F5E6C8]' : 'text-[#4A3D28]'}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option} value={option} className="bg-[#1C1810]">
            {option}
          </option>
        ))}
      </select>

      {error && (
        <span className="text-red-400 text-xs flex items-center gap-1">
          <TriangleAlert size={12} className="flex-shrink-0" />
          {error}
        </span>
      )}
    </div>
  )
}
