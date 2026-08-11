interface Props {
  eyebrow: string
  title: string
}

export default function SectionHeader({ eyebrow, title }: Props) {
  return (
    <div className="mb-16 text-center">
      <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
        {eyebrow}
      </p>

      <h2 className="text-4xl font-black text-[#F5E6C8] md:text-5xl">
        {title}
      </h2>

      <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
    </div>
  )
}
