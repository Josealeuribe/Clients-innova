import { useState, useRef, useEffect } from 'react'
import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/logo.png'
import Footer from '@/shared/components/Footer'

interface Props {
  navigate: (page: Page) => void
  onPrizeWon: (prize: string) => void
}

const PRIZES = [
  { label: '5,000', sublabel: 'Créditos', color: '#C9A227', lightColor: '#F0C847', prize: '5,000 Créditos Promocionales', emoji: '💰', detail: 'Acreditados directamente en tu cuenta.' },
  { label: 'Bono', sublabel: 'Especial', color: '#7B1515', lightColor: '#B52020', prize: 'Bono de Bienvenida Especial', emoji: '🎁', detail: 'Bono exclusivo para nuevos miembros.' },
  { label: 'Cartón', sublabel: 'Bingo', color: '#3D006B', lightColor: '#6A00B8', prize: 'Cartón de Bingo Premium', emoji: '🎴', detail: 'Para el próximo evento en vivo del club.' },
  { label: 'Giro', sublabel: 'Extra', color: '#002B70', lightColor: '#004FCC', prize: 'Giro Adicional en la Ruleta', emoji: '🔄', detail: 'Vuelve a girar y gana otro premio.' },
  { label: '10,000', sublabel: 'Créditos', color: '#8A6000', lightColor: '#C08800', prize: '10,000 Créditos Promocionales', emoji: '⭐', detail: 'Nuestro premio mayor de créditos.' },
  { label: 'Bono', sublabel: 'VIP', color: '#7B1515', lightColor: '#B52020', prize: 'Bono VIP Exclusivo', emoji: '👑', detail: 'Acceso a beneficios de nivel platinum.' },
  { label: 'Entrada', sublabel: 'Evento', color: '#0D3B0D', lightColor: '#1A6E1A', prize: 'Entrada a Evento Especial', emoji: '🎪', detail: 'Acceso VIP al próximo evento del club.' },
  { label: 'Premio', sublabel: 'Sorpresa', color: '#3D006B', lightColor: '#6A00B8', prize: 'Premio Sorpresa Exclusivo', emoji: '🎉', detail: 'Una sorpresa especial de Innova Club.' },
]

const ROULETTE_NUMBERS = ['0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36', '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9', '22', '18', '29', '7', '28', '12', '35', '3', '26']
const RED_NUMBERS = ['32', '19', '21', '25', '34', '27', '36', '30', '23', '5', '16', '1', '14', '9', '18', '7', '12', '3']

const TOTAL = ROULETTE_NUMBERS.length
const SEG_ANGLE = 360 / TOTAL

function segPath(i: number, cx: number, cy: number, r: number): string {
  const angle = (2 * Math.PI) / TOTAL
  const sa = i * angle - Math.PI / 2
  const ea = (i + 1) * angle - Math.PI / 2
  const x1 = cx + r * Math.cos(sa)
  const y1 = cy + r * Math.sin(sa)
  const x2 = cx + r * Math.cos(ea)
  const y2 = cy + r * Math.sin(ea)
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
}

function segTextPos(i: number, cx: number, cy: number, r: number) {
  const angle = (2 * Math.PI) / TOTAL
  const mid = (i + 0.5) * angle - Math.PI / 2
  const tr = r * 0.86 // Place text near the outer rim
  return {
    x: cx + tr * Math.cos(mid),
    y: cy + tr * Math.sin(mid),
    deg: (mid * 180 / Math.PI) + 90,
  }
}

function Confetti() {
  const colors = ['#D4AF37', '#F0C847', '#8B1A1A', '#B52020', '#4B0082', '#0a0805', '#F5E6C8']
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => {
        const color = colors[i % colors.length]
        const left = `${Math.random() * 100}%`
        const delay = `${Math.random() * 1.5}s`
        const duration = `${2 + Math.random() * 2}s`
        const size = 6 + Math.floor(Math.random() * 8)
        return (
          <div key={i}
            className="absolute"
            style={{
              left, top: '-20px',
              width: size, height: size,
              background: color,
              borderRadius: i % 2 === 0 ? '50%' : '2px',
              animation: `confetti-drop ${duration} ease-in forwards`,
              animationDelay: delay,
            }}
          />
        )
      })}
    </div>
  )
}

interface PrizeModalProps {
  segmentIndex: number
  onClaim: () => void
  onClose: () => void
}

function PrizeModal({ segmentIndex, onClaim, onClose }: PrizeModalProps) {
  const seg = PRIZES[segmentIndex]
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.82)' }}>
      <div className="relative max-w-md w-full rounded-3xl border border-[#D4AF37]/40 p-8 text-center"
        style={{
          background: 'linear-gradient(145deg, #1C1810 0%, #121009 100%)',
          animation: 'modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
          boxShadow: '0 0 60px rgba(212,175,55,0.2), 0 30px 80px rgba(0,0,0,0.6)'
        }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#D4AF37]/25 flex items-center justify-center text-[#9A7B50] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all text-sm">
          ✕
        </button>

        {/* Trophy icon */}
        <div className="text-7xl mb-3 relative">
          <span style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.5))' }}>{seg.emoji}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/8 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2" style={{ fontFamily: "'Sreda', serif" }}>
          ¡FELICITACIONES!
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-[#F5E6C8] mb-2 leading-tight" style={{ fontFamily: "'Sreda', serif" }}>
          {seg.prize}
        </h2>
        <p className="text-[#9A7B50] text-sm mb-2">{seg.detail}</p>

        <div className="my-5 mx-auto w-3/4 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

        <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-3 mb-6 text-sm text-[#C4A97A]">
          <span className="block font-semibold text-[#D4AF37] mb-1">Premio reservado:</span>
          Tienes 30 minutos para reclamarlo. Completa tu registro para no perderlo.
        </div>

        <button onClick={onClaim}
          className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
          style={{
            fontFamily: "'Sreda', serif",
            background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
            letterSpacing: '0.06em',
            animation: 'pulse-glow 2s ease-in-out infinite'
          }}>
          🏆 Reclamar mi Premio
        </button>

        <button onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all">
          Ver condiciones
        </button>
      </div>
    </div>
  )
}

export default function RoulettePage({ navigate, onPrizeWon }: Props) {
  const [rotation, setRotation] = useState(0)
  const [ballRotation, setBallRotation] = useState(0)
  const [ballRadius, setBallRadius] = useState(195) // Starts at the outer track

  const [isSpinning, setIsSpinning] = useState(false)
  const [wonPrizeIdx, setWonPrizeIdx] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  const cx = 220, cy = 220, r = 182

  const spin = () => {
    if (isSpinning || showModal) return
    setWonPrizeIdx(null)
    setIsSpinning(true)
    setBallRadius(195)

    const targetPocket = Math.floor(Math.random() * TOTAL)
    const targetPrize = Math.floor(Math.random() * PRIZES.length)

    // Wheel rotates clockwise
    const targetAngle = targetPocket * SEG_ANGLE + SEG_ANGLE / 2
    const currentMod = rotation % 360
    const extra = (targetAngle - currentMod + 360) % 360
    const totalWheelSpins = 6 * 360 + extra
    const newRot = rotation + totalWheelSpins

    // Calculate ball absolute target angle so it lands in targetPocket
    const pocketAbsAngle = newRot + (targetPocket * SEG_ANGLE)

    // Ball spins counter-clockwise around 10 times
    let targetBallRot = ballRotation - (360 * 10)
    const remainder = pocketAbsAngle % 360
    targetBallRot = Math.floor(targetBallRot / 360) * 360 + remainder
    if (targetBallRot > ballRotation - 360 * 6) {
        targetBallRot -= 360
    }

    setRotation(newRot)

    // Animate ball drop after 2 seconds
    setTimeout(() => {
      setBallRadius(142) // Drop to pocket radius
    }, 2000)

    // Ball starts moving immediately
    setBallRotation(targetBallRot)

    setTimeout(() => {
      setIsSpinning(false)
      setWonPrizeIdx(targetPrize)
      setShowConfetti(true)
      setTimeout(() => setShowModal(true), 600)
      setTimeout(() => setShowConfetti(false), 4000)
    }, 4550)
  }

  const handleClaim = () => {
    if (wonPrizeIdx !== null) {
      onPrizeWon(PRIZES[wonPrizeIdx].prize)
    }
    setShowModal(false)
    navigate('register')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-6 pb-16 px-4 relative overflow-hidden bg-transparent"
      style={{ background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(139,26,26,0.3) 0%, transparent 60%)' }}>

      {showConfetti && <Confetti />}
      {showModal && wonPrizeIdx !== null && (
        <PrizeModal
          segmentIndex={wonPrizeIdx}
          onClaim={handleClaim}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header */}
      <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
        <button onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-[#9A7B50] hover:text-[#D4AF37] transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver
        </button>
        <img src={logoImg} alt="Innova Club SAS" className="h-12 w-auto" />
        <div className="w-16" />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2" style={{ fontFamily: "'Sreda', serif" }}>
          PROMOCIÓN DE BIENVENIDA
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Sreda', serif" }}>
          ¡Es tu momento de ganar!
        </h1>
        <p className="text-[#9A7B50] mt-2 text-sm max-w-sm mx-auto">
          Presiona el botón, gira la ruleta y descubre el beneficio que tenemos para ti.
        </p>
      </div>

      {/* Wheel container */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer glow */}
        <div className="absolute rounded-full"
          style={{
            width: 460, height: 460,
            background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
            animation: isSpinning ? 'pulse-glow 0.8s ease-in-out infinite' : 'pulse-glow 3s ease-in-out infinite'
          }}
        />

        {/* Fixed pointer */}
        <div className="absolute z-20 flex flex-col items-center"
          style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="w-0 h-0"
            style={{
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '28px solid #D4AF37',
              filter: 'drop-shadow(0 4px 8px rgba(212,175,55,0.8))'
            }}
          />
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            willChange: 'transform',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.7))'
          }}
          className="rounded-full"
        >
          <svg viewBox="0 0 440 440" width={420} height={420} style={{ display: 'block' }}>
            <defs>
              <filter id="segShadow">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
              </filter>
              <radialGradient id="goldRim" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#8A6327" />
                <stop offset="85%" stopColor="#E6C27A" />
                <stop offset="95%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#6A4B1A" />
              </radialGradient>
              <radialGradient id="woodRim" cx="50%" cy="50%" r="50%">
                <stop offset="75%" stopColor="#301509" />
                <stop offset="95%" stopColor="#5C2B14" />
                <stop offset="100%" stopColor="#1A0C05" />
              </radialGradient>
              <linearGradient id="metalHub" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E6C27A" />
                <stop offset="30%" stopColor="#D4AF37" />
                <stop offset="70%" stopColor="#8A6327" />
                <stop offset="100%" stopColor="#593C11" />
              </linearGradient>
            </defs>

            {/* Base/Rim - Drawn FIRST so it stays behind segments */}
            <circle cx={cx} cy={cy} r={r + 20} fill="url(#woodRim)" />
            <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="url(#goldRim)" strokeWidth="12" />

            {/* Segments */}
            {ROULETTE_NUMBERS.map((num, i) => {
              const pos = segTextPos(i, cx, cy, r)
              const isGreen = num === '0'
              const isRed = RED_NUMBERS.includes(num)
              const fillColor = isGreen ? '#1A6E1A' : (isRed ? '#B52020' : '#1C1810')
              const lightColor = isGreen ? '#2CB52C' : (isRed ? '#F0C847' : '#2A241A')

              return (
                <g key={i}>
                  <path
                    d={segPath(i, cx, cy, r)}
                    fill={fillColor}
                    stroke="#0a0805"
                    strokeWidth="0.5"
                  />
                  {/* Subtle inner arc for depth */}
                  <path
                    d={segPath(i, cx, cy, r * 0.95)}
                    fill={lightColor}
                    opacity="0.1"
                    stroke="none"
                  />
                  {/* Outer pocket separator */}
                  <path
                    d={segPath(i, cx, cy, r * 0.7)}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    opacity="0.3"
                  />
                  {/* Text (Number) */}
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${pos.deg}, ${pos.x}, ${pos.y})`}
                    fill="#fff"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="Sreda, sans-serif"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {num}
                  </text>
                </g>
              )
            })}

            {/* Inner rim shadow to add depth to segments */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="10" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="20" />
            <circle cx={cx} cy={cy} r={r - 35} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="10" />

            {/* Segment dividers (gold lines from center) */}
            {ROULETTE_NUMBERS.map((_, i) => {
              const angle = (i * (2 * Math.PI) / TOTAL) - Math.PI / 2
              const x2 = cx + (r) * Math.cos(angle)
              const y2 = cy + (r) * Math.sin(angle)
              return (
                <line key={i} x1={cx} y1={cy} x2={x2.toFixed(2)} y2={y2.toFixed(2)}
                  stroke="url(#metalHub)" strokeWidth="1.5" opacity="0.6" />
              )
            })}

            {/* Realistic Metal Center Hub */}
            <circle cx={cx} cy={cy} r="38" fill="url(#metalHub)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.6))" />
            <circle cx={cx} cy={cy} r="28" fill="#1A140C" stroke="url(#goldRim)" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="22" fill="url(#metalHub)" opacity="0.9" />
            <circle cx={cx} cy={cy} r="12" fill="#2A2218" />
            <circle cx={cx} cy={cy} r="6" fill="url(#goldRim)" />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#0a0805" fontSize="12" fontWeight="900">✦</text>

            {/* Decorative gold studs on the outer rim */}
            {[...Array(24)].map((_, i) => {
              const angle = (i * 2 * Math.PI / 24) - Math.PI / 2
              const dr = r + 14 // middle of the gold rim
              return (
                <circle key={i} cx={cx + dr * Math.cos(angle)} cy={cy + dr * Math.sin(angle)}
                  r="3.5" fill="url(#metalHub)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.9))" />
              )
            })}
          </svg>
        </div>

        {/* The Ball Animation Layer */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
          style={{
            transform: `rotate(${ballRotation}deg)`,
            transition: isSpinning ? 'transform 4.5s cubic-bezier(0.12, 0, 0.39, 1)' : 'none',
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 14, height: 14,
              background: 'radial-gradient(circle at 30% 30%, #fff 0%, #d4d4d4 40%, #737373 100%)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.4)',
              top: `calc(50% - ${ballRadius}px - 7px)`,
              left: `calc(50% - 7px)`,
              transition: isSpinning ? 'top 2.5s cubic-bezier(0.4, 0, 1, 1)' : 'none',
              transformOrigin: 'center'
            }}
          />
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center">
        <button
          onClick={spin}
          disabled={isSpinning || showModal}
          className="px-10 py-4 rounded-full font-black text-base tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Sreda', serif",
            background: isSpinning
              ? 'linear-gradient(135deg, #8A7020, #6A5518)'
              : 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
            color: '#0a0805',
            letterSpacing: '0.1em',
            minWidth: 220,
            animation: isSpinning ? 'none' : 'pulse-glow 2.5s ease-in-out infinite',
            transform: isSpinning ? 'scale(0.97)' : 'scale(1)'
          }}
        >
          {isSpinning ? '⏳ Descubriendo tu premio...' : '🎰 Girar Ruleta'}
        </button>

        <p className="mt-3 text-[#6B5D3F] text-xs">
          Un giro por promoción · <button onClick={() => navigate('terms')} className="hover:text-[#9A7B50] transition-colors underline">Ver términos</button>
        </p>
      </div>

      {/* Prize legend */}
      {!isSpinning && wonPrizeIdx === null && (
        <div className="mt-10 max-w-lg w-full z-10 relative">
          <p className="text-center text-[#6B5D3F] text-xs mb-4 tracking-wider uppercase" style={{ fontFamily: "'Sreda', serif" }}>Premios en juego</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRIZES.map((seg, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D4AF37]/10 text-xs text-[#9A7B50]"
                style={{ background: 'rgba(18,16,9,0.7)', backdropFilter: 'blur(4px)' }}>
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
                <span className="truncate">{seg.label} {seg.sublabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full -mx-4 mt-auto">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
