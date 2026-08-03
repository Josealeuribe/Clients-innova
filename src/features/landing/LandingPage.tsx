import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/logo.png'
import Footer from '@/shared/components/Footer'

interface Props {
  navigate: (page: Page) => void
}

const prizes = [
  { icon: '💰', name: 'Créditos Promocionales', desc: 'Hasta 10,000 créditos para usar en tu cuenta', tag: 'MÁS POPULAR' },
  { icon: '🎁', name: 'Bonos de Bienvenida', desc: 'Bonificaciones exclusivas para nuevos miembros', tag: 'EXCLUSIVO' },
  { icon: '🎴', name: 'Cartones de Bingo', desc: 'Cartones premium para los mejores eventos en vivo', tag: 'NUEVO' },
  { icon: '🎪', name: 'Entradas a Eventos', desc: 'Acceso VIP a eventos especiales del club', tag: 'VIP' },
  { icon: '🔄', name: 'Giros Adicionales', desc: 'Más oportunidades de descubrir premios increíbles', tag: 'BONUS' },
  { icon: '⭐', name: 'Premios Sorpresa', desc: 'Beneficios exclusivos para nuestros mejores clientes', tag: 'PREMIUM' },
]

const steps = [
  { num: '01', title: 'Gira la Ruleta', desc: 'Presiona el botón y participa en nuestra promoción de bienvenida. Es gratis y no requiere registro previo.' },
  { num: '02', title: 'Descubre tu Premio', desc: 'La ruleta se detiene y revela el beneficio exclusivo que tenemos preparado para ti.' },
  { num: '03', title: 'Regístrate y Reclámalo', desc: 'Completa tus datos en minutos. Tu premio queda reservado mientras lo reclamas.' },
]

function WheelPreview({ size = 340 }: { size?: number }) {
  const nums = ['0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36', '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9', '22', '18', '29', '7', '28', '12', '35', '3', '26']
  const redNums = ['32', '19', '21', '25', '34', '27', '36', '30', '23', '5', '16', '1', '14', '9', '18', '7', '12', '3']

  const cx = 220, cy = 220, r = 182
  const total = 37
  const glowSize = size + 120

  function segPath(i: number, radius: number = r) {
    const angle = (2 * Math.PI) / total
    const sa = i * angle - Math.PI / 2
    const ea = (i + 1) * angle - Math.PI / 2
    const x1 = cx + radius * Math.cos(sa)
    const y1 = cy + radius * Math.sin(sa)
    const x2 = cx + radius * Math.cos(ea)
    const y2 = cy + radius * Math.sin(ea)
    return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
  }

  function segTextPos(i: number) {
    const angle = (2 * Math.PI) / total
    const mid = (i + 0.5) * angle - Math.PI / 2
    const tr = r * 0.86
    return {
      x: cx + tr * Math.cos(mid),
      y: cy + tr * Math.sin(mid),
      deg: (mid * 180 / Math.PI) + 90,
    }
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute rounded-full"
        style={{
          width: glowSize, height: glowSize,
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
          animation: 'pulse-glow 3s ease-in-out infinite'
        }}
      />

      <div style={{ animation: 'spin-wheel 15s linear infinite', display: 'inline-block' }} className="rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
        <svg viewBox="0 0 440 440" width={size} height={size} style={{ display: 'block' }}>
          <defs>
            <filter id="segShadowLanding">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
            </filter>
            <radialGradient id="goldRimLanding" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#8A6327" />
              <stop offset="85%" stopColor="#E6C27A" />
              <stop offset="95%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#6A4B1A" />
            </radialGradient>
            <radialGradient id="woodRimLanding" cx="50%" cy="50%" r="50%">
              <stop offset="75%" stopColor="#301509" />
              <stop offset="95%" stopColor="#5C2B14" />
              <stop offset="100%" stopColor="#1A0C05" />
            </radialGradient>
            <linearGradient id="metalHubLanding" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6C27A" />
              <stop offset="30%" stopColor="#D4AF37" />
              <stop offset="70%" stopColor="#8A6327" />
              <stop offset="100%" stopColor="#593C11" />
            </linearGradient>
          </defs>

          {/* Base/Rim */}
          <circle cx={cx} cy={cy} r={r + 20} fill="url(#woodRimLanding)" />
          <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="url(#goldRimLanding)" strokeWidth="12" />

          {/* Segments */}
          {nums.map((num, i) => {
            const pos = segTextPos(i)
            const isGreen = num === '0'
            const isRed = redNums.includes(num)
            const fillColor = isGreen ? '#1A6E1A' : (isRed ? '#B52020' : '#1C1810')
            const lightColor = isGreen ? '#2CB52C' : (isRed ? '#F0C847' : '#2A241A')

            return (
              <g key={i}>
                <path d={segPath(i, r)} fill={fillColor} stroke="#0a0805" strokeWidth="0.5" />
                <path d={segPath(i, r * 0.95)} fill={lightColor} opacity="0.1" stroke="none" />
                <path d={segPath(i, r * 0.7)} fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.3" />
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${pos.deg}, ${pos.x}, ${pos.y})`} fill="#fff" fontSize="13" fontWeight="800" fontFamily="Sreda, sans-serif" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {num}
                </text>
              </g>
            )
          })}

          {/* Inner rim shadow */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="10" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="20" />
          <circle cx={cx} cy={cy} r={r - 35} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="10" />

          {/* Dividers */}
          {nums.map((_, i) => {
            const angle = (i * (2 * Math.PI) / total) - Math.PI / 2
            const x2 = cx + (r) * Math.cos(angle)
            const y2 = cy + (r) * Math.sin(angle)
            return (
              <line key={i} x1={cx} y1={cy} x2={x2.toFixed(2)} y2={y2.toFixed(2)} stroke="url(#metalHubLanding)" strokeWidth="1.5" opacity="0.6" />
            )
          })}

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r="38" fill="url(#metalHubLanding)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.6))" />
          <circle cx={cx} cy={cy} r="28" fill="#1A140C" stroke="url(#goldRimLanding)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="22" fill="url(#metalHubLanding)" opacity="0.9" />
          <circle cx={cx} cy={cy} r="12" fill="#2A2218" />
          <circle cx={cx} cy={cy} r="6" fill="url(#goldRimLanding)" />
          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#0a0805" fontSize="12" fontWeight="900">✦</text>

          {/* Studs */}
          {[...Array(24)].map((_, i) => {
            const angle = (i * 2 * Math.PI / 24) - Math.PI / 2
            const dr = r + 14
            return (
              <circle key={i} cx={cx + dr * Math.cos(angle)} cy={cy + dr * Math.sin(angle)} r="3.5" fill="url(#metalHubLanding)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.9))" />
            )
          })}
        </svg>
      </div>

      {/* CSS animated ball moving around the track */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10" style={{ animation: 'spin-ball 4s linear infinite reverse' }}>
        <div className="absolute rounded-full" style={{ width: 12, height: 12, background: 'radial-gradient(circle at 30% 30%, #fff 0%, #d4d4d4 40%, #737373 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.4)', top: `calc(50% - 150px - 6px)`, left: `calc(50% - 6px)` }} />
      </div>
    </div>
  )
}

export default function LandingPage({ navigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-transparent">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/20"
        style={{ background: 'rgba(10,8,5,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={logoImg} alt="Innova Club SAS" className="h-12 w-auto" />

          <div className="hidden md:flex items-center gap-8">
            {['Inicio', 'Premios', 'Cómo Funciona', 'FAQ'].map(item => (
              <a key={item} href="#" className="text-sm font-medium text-[#C4A97A] hover:text-[#D4AF37] transition-colors tracking-wide">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('login')}
              className="hidden md:inline-flex items-center px-5 py-2 text-sm font-semibold text-[#D4AF37] border border-[#D4AF37]/50 rounded-full hover:bg-[#D4AF37]/10 transition-all"
              style={{ fontFamily: "'Sreda', serif", letterSpacing: '0.05em' }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-[#D4AF37] p-2"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                  : <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>
                }
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#D4AF37]/20 bg-[#0a0805] px-6 py-4 flex flex-col gap-4">
            {['Inicio', 'Premios', 'Cómo Funciona', 'FAQ'].map(item => (
              <a key={item} href="#" className="text-[#C4A97A] hover:text-[#D4AF37] transition-colors text-sm" onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
            <button onClick={() => navigate('login')} className="text-left text-[#D4AF37] text-sm font-semibold border border-[#D4AF37]/40 rounded-full px-4 py-2 w-fit">
              Iniciar Sesión
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-0 relative overflow-hidden">
        {/* Decorative stars */}
        {[...Array(18)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-[#D4AF37]"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              left: `${(i * 23 + 7) % 95}%`,
              top: `${(i * 17 + 5) % 80}%`,
              opacity: 0.3 + (i % 4) * 0.1,
              animation: `flicker-star ${2 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.4)}s`
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-96px)]">
            {/* Left */}
            <div className="text-center md:text-left" style={{ animation: 'slide-up 0.8s ease-out forwards' }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/8 mb-6">
                <span className="text-[#D4AF37] text-xs font-bold tracking-widest" style={{ fontFamily: "'Sreda', serif" }}>
                  ✦ PROMOCIÓN EXCLUSIVA ✦
                </span>
              </div>

              <h1 className="mb-5 leading-none" style={{ fontFamily: "'Sreda', serif" }}>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #F0C847 0%, #D4AF37 40%, #A0832A 70%, #D4AF37 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gold-shimmer 4s linear infinite'
                  }}
                >
                  Gira,
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-black text-[#F5E6C8]">
                  gana y
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #F0C847 0%, #D4AF37 40%, #A0832A 70%, #D4AF37 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gold-shimmer 4s linear infinite',
                    animationDelay: '0.5s'
                  }}
                >
                  disfruta.
                </span>
              </h1>

              <p className="text-[#C4A97A] text-lg md:text-xl leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                Participa en nuestra promoción de bienvenida, gira la ruleta y reclama beneficios exclusivos en Innova Club SAS.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate('roulette')}
                  className="px-8 py-4 rounded-full text-[#0a0805] font-bold text-base tracking-wide transition-all hover:scale-105 active:scale-95"
                  style={{
                    fontFamily: "'Sreda', serif",
                    background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
                    animation: 'pulse-glow 2.5s ease-in-out infinite',
                    letterSpacing: '0.08em'
                  }}
                >
                  🎰 Gira y Gana
                </button>
                <button
                  onClick={() => navigate('login')}
                  className="px-8 py-4 rounded-full font-semibold text-base text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all"
                  style={{ fontFamily: "'Sreda', serif", letterSpacing: '0.06em' }}
                >
                  Ya tengo cuenta
                </button>
              </div>

              <p className="mt-4 text-[#6B5D3F] text-xs text-center md:text-left">
                Aplican términos y condiciones. Solo para mayores de 18 años.
              </p>
            </div>

            {/* Right — wheel preview */}
            <div className="flex justify-center items-center relative">
              {/* Glow ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full"
                  style={{
                    width: 360, height: 360,
                    background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
                    animation: 'pulse-glow 3s ease-in-out infinite'
                  }}
                />
              </div>

              {/* Outer ring decoration — stays in place; only the wheel itself spins */}
              <div className="relative">
                <div className="rounded-full border-2 border-[#D4AF37]/30 p-4">
                  <div className="rounded-full border border-[#D4AF37]/15 p-3">
                    <WheelPreview size={380} />
                  </div>
                </div>

                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                  <div className="w-0 h-0"
                    style={{
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderTop: '22px solid #D4AF37',
                      filter: 'drop-shadow(0 2px 4px rgba(212,175,55,0.6))'
                    }}
                  />
                </div>

                {/* Floating chips */}
                {['♠', '♥', '♦', '♣'].map((suit, i) => (
                  <div key={i} className="absolute text-xl"
                    style={{
                      color: i % 2 === 0 ? '#D4AF37' : '#8B1A1A',
                      top: `${[10, 80, 10, 80][i]}%`,
                      left: `${[-8, -10, 108, 110][i]}%`,
                      animation: `float-gentle ${3 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.7}s`,
                      opacity: 0.7
                    }}
                  >
                    {suit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Prizes Section */}
      <section id="premios" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-3" style={{ fontFamily: "'Sreda', serif" }}>
              BENEFICIOS EXCLUSIVOS
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Sreda', serif" }}>
              Premios Disponibles
            </h2>
            <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {prizes.map((prize, i) => (
              <div key={i}
                className="group relative rounded-2xl p-6 border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 transition-all duration-300 cursor-default backdrop-blur-md"
                style={{ background: 'linear-gradient(145deg, rgba(28,24,16,0.65), rgba(18,16,9,0.75))' }}
              >
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-full"
                    style={{
                      fontFamily: "'Sreda', serif",
                      background: 'rgba(212,175,55,0.12)',
                      color: '#D4AF37',
                      border: '1px solid rgba(212,175,55,0.25)'
                    }}>
                    {prize.tag}
                  </span>
                </div>

                <div className="text-4xl mb-4">{prize.icon}</div>
                <h3 className="text-lg font-bold text-[#F5E6C8] mb-2" style={{ fontFamily: "'Sreda', serif" }}>
                  {prize.name}
                </h3>
                <p className="text-sm text-[#9A7B50] leading-relaxed">{prize.desc}</p>

                <div className="mt-4 h-px bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-3" style={{ fontFamily: "'Sreda', serif" }}>
              PROCESO SIMPLE
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Sreda', serif" }}>
              Cómo Funciona
            </h2>
            <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[33%] right-[33%] h-px bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37]/60 to-[#D4AF37]/30" />

            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="mx-auto mb-6 relative w-24 h-24 flex items-center justify-center rounded-full border-2 border-[#D4AF37]/40 backdrop-blur-sm"
                  style={{ background: 'linear-gradient(145deg, rgba(28,24,16,0.8), rgba(18,16,9,0.8))' }}>
                  <span className="text-3xl font-black text-[#D4AF37]" style={{ fontFamily: "'Sreda', serif" }}>
                    {step.num}
                  </span>
                  <div className="absolute inset-0 rounded-full" style={{ animation: 'pulse-glow 3s ease-in-out infinite', animationDelay: `${i * 0.8}s` }} />
                </div>
                <h3 className="text-xl font-bold text-[#F5E6C8] mb-3" style={{ fontFamily: "'Sreda', serif" }}>
                  {step.title}
                </h3>
                <p className="text-[#9A7B50] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at center, rgba(212,175,55,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="text-5xl mb-6">🎰</div>
          <h2 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-4 leading-tight" style={{ fontFamily: "'Sreda', serif" }}>
            Tu premio puede estar<br />
            <span style={{
              background: 'linear-gradient(135deg, #F0C847, #D4AF37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              a un giro de distancia
            </span>
          </h2>
          <p className="text-[#9A7B50] mb-8 text-lg">No necesitas tarjeta de crédito ni registro previo. Solo gira y descubre.</p>
          <button
            onClick={() => navigate('roulette')}
            className="px-10 py-4 rounded-full text-[#0a0805] font-bold text-base tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Sreda', serif",
              background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
              letterSpacing: '0.08em',
              animation: 'pulse-glow 2.5s ease-in-out infinite'
            }}
          >
            ✦ Girar Ahora ✦
          </button>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  )
}
