interface Props {
  size: number
}

const CX = 300
const CY = 300
const OUTER_WOOD_R = 280
const RAIL_OUTER_R = 232
const RAIL_INNER_R = 196
const STUD_COUNT = 22

export default function CasinoTable({ size }: Props) {
  const studRadius = (RAIL_OUTER_R + RAIL_INNER_R) / 2

  return (
    <svg
      viewBox="0 0 600 600"
      width={size}
      height={size}
      style={{ display: 'block', filter: 'drop-shadow(0 18px 14px rgba(0,0,0,0.6))' }}
    >
      <defs>
        <linearGradient id="casinoTableWood" x1="10%" y1="5%" x2="90%" y2="95%">
          <stop offset="0%" stopColor="#170B04" />
          <stop offset="30%" stopColor="#6B3D1B" />
          <stop offset="50%" stopColor="#D19A5C" />
          <stop offset="70%" stopColor="#6B3D1B" />
          <stop offset="100%" stopColor="#170B04" />
        </linearGradient>
        <radialGradient id="casinoTableFloor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2A1810" />
          <stop offset="100%" stopColor="#120A05" />
        </radialGradient>
      </defs>

      {/* Polished wood table surface */}
      <circle cx={CX} cy={CY} r={OUTER_WOOD_R} fill="url(#casinoTableWood)" />
      <circle cx={CX} cy={CY} r={OUTER_WOOD_R} fill="none" stroke="#0A0502" strokeWidth="6" />

      {/* Leather rail with brass chip-rest studs */}
      <circle cx={CX} cy={CY} r={RAIL_OUTER_R} fill="#3B0F0F" />
      <circle cx={CX} cy={CY} r={RAIL_OUTER_R} fill="none" stroke="#210808" strokeWidth="2" />
      {[...Array(STUD_COUNT)].map((_, i) => {
        const angle = (i * 2 * Math.PI) / STUD_COUNT - Math.PI / 2
        const sx = CX + studRadius * Math.cos(angle)
        const sy = CY + studRadius * Math.sin(angle)
        const deg = (angle * 180) / Math.PI + 90
        return (
          <ellipse key={i} cx={sx} cy={sy} rx="9" ry="5"
            transform={`rotate(${deg}, ${sx}, ${sy})`}
            fill="#E8D9B5" opacity="0.92" />
        )
      })}

      {/* Recessed floor beneath the wheel */}
      <circle cx={CX} cy={CY} r={RAIL_INNER_R} fill="url(#casinoTableFloor)" />
    </svg>
  )
}
