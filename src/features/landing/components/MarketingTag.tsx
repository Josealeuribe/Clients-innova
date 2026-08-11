interface Props {
  label?: string
}

export default function MarketingTag({ label }: Props) {
  if (!label) return null

  return (
    <div className="absolute right-3 top-3">
      <span
        className="rounded-full px-2 py-1 text-[10px] font-bold tracking-wider"
        style={{
          background: 'rgba(212,175,55,0.12)',
          color: '#D4AF37',
          border: '1px solid rgba(212,175,55,0.25)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
