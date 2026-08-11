interface Props {
  label: string
  color: string
}

export default function StatusBadge({ label, color }: Props) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  )
}
