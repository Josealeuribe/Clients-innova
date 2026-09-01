interface Props {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  required?: boolean
}

export default function FormCheckbox({
  label,
  checked,
  onChange,
  required = false,
}: Props) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all
          ${checked
            ? 'bg-[#D4AF37] border-[#D4AF37]'
            : 'border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60'}`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L4 7L9 1"
              stroke="#0a0805"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <span className="text-sm text-[#9A7B50] leading-relaxed">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
    </label>
  )
}
