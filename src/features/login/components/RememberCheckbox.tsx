interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function RememberCheckbox({ checked, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
          ${checked ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#D4AF37]/30'}`}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L4 7L9 1" stroke="#0a0805" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="text-xs text-[#6B5D3F]">Recordarme</span>
    </label>
  )
}
