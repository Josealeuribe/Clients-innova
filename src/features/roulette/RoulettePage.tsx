import { useEffect, useRef, useState } from 'react'
import { X, CircleCheck, Lock, Info } from 'lucide-react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
import { RouletteSpinCommand } from './types/roulette.types'
import { TOTAL_POCKETS } from './constants/roulette.constants'
import Roulette3D from './components/Roulette3D'
import { PRIZES } from '@/shared/data/prizes'
import { spinRoulette, fetchGirosRestantes, ApiError } from '@/shared/api/client'
import { createRouletteSound } from '@/shared/audio/rouletteSound'

interface Props {
  navigate: (page: Page) => void
  onPrizeWon: (prize: string, ticket: string) => void
}

function Confetti() {
  const colors = ['#D4AF37', '#F0C847', '#8B1A1A', '#B52020', '#4B0082', '#0a0805', '#F5E6C8']

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }, (_, index) => {
        const color = colors[index % colors.length]
        const left = `${Math.random() * 100}%`
        const delay = `${Math.random() * 1.5}s`
        const duration = `${2 + Math.random() * 2}s`
        const size = 6 + Math.floor(Math.random() * 8)

        return (
          <div
            key={index}
            className="absolute"
            style={{
              left,
              top: '-20px',
              width: size,
              height: size,
              background: color,
              borderRadius: index % 2 === 0 ? '50%' : '2px',
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
  const prize = PRIZES[segmentIndex]
  const { monetary } = prize

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)' }}
    >
      <div
        className="relative max-w-md w-full rounded-3xl border border-[#D4AF37]/40 p-8 text-center"
        style={{
          background: 'linear-gradient(145deg, #1C1810 0%, #121009 100%)',
          animation: 'modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
          boxShadow: '0 0 60px rgba(212,175,55,0.2), 0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#D4AF37]/25 flex items-center justify-center text-[#9A7B50] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
        >
          <X size={16} />
        </button>

        <div className="mb-3 relative flex items-center justify-center">
          <prize.icon size={72} className="text-[#D4AF37]" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.5))' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full bg-[#D4AF37]/8 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>

        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">
          ¡FELICITACIONES!
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-[#F5E6C8] mb-2 leading-tight">
          {prize.prize}
        </h2>
        <p className="text-[#9A7B50] text-sm mb-2">{prize.detail}</p>

        <div className="my-5 mx-auto w-3/4 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

        <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-3 mb-6 text-sm text-[#C4A97A]">
          {monetary ? (
            <>
              <span className="block font-semibold text-[#D4AF37] mb-1">Bono reservado:</span>
              Tienes 30 minutos para reclamarlo. Completa tu registro para dejarlo reservado a tu nombre y redímelo en cualquiera de nuestras sedes.
            </>
          ) : (
            <>
              <span className="block font-semibold text-[#D4AF37] mb-1">Beneficio del club:</span>
              Este premio es una cortesía o experiencia de Gran Casino Cucuta, redimible únicamente en sede. Tienes 30 minutos para reclamarlo completando tu registro. Ningún premio se entrega en efectivo ni por transferencia.
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClaim}
          className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
          style={{
            background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
            letterSpacing: '0.06em',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        >
          Reclamar mi Premio
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all"
        >
          Ver condiciones
        </button>
      </div>
    </div>
  )
}

interface YaParticipasteModalProps {
  tieneBono: boolean
  bonoCanjeado: boolean
  codigo: string | null
  onClose: () => void
  onVerCuenta: () => void
}

// La promocion da un unico bono por persona (BonoGanado.clienteId es @unique
// en la base). Si el cliente que tiene la sesion abierta ya lo obtuvo, la
// ruleta no vuelve a girar: se le explica por que en vez de dejarlo girar y
// fallar despues al reclamar.
function YaParticipasteModal({ tieneBono, bonoCanjeado, codigo, onClose, onVerCuenta }: YaParticipasteModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.82)' }}>
      <div
        className="relative max-w-md w-full rounded-3xl border border-[#D4AF37]/40 p-8 text-center"
        style={{
          background: 'linear-gradient(145deg, #1C1810 0%, #121009 100%)',
          animation: 'modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
          boxShadow: '0 0 60px rgba(212,175,55,0.2), 0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#D4AF37]/25 flex items-center justify-center text-[#9A7B50] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
        >
          <X size={16} />
        </button>

        <div className="mb-3 flex items-center justify-center">
          {bonoCanjeado ? (
            <CircleCheck size={64} className="text-[#D4AF37]" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.45))' }} />
          ) : (
            <Lock size={64} className="text-[#D4AF37]" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.45))' }} />
          )}
        </div>

        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">YA PARTICIPASTE</p>
        <h2 className="text-2xl md:text-3xl font-black text-[#F5E6C8] mb-3 leading-tight">
          {!tieneBono ? 'La ruleta es para nuevos jugadores' : bonoCanjeado ? 'Ya redimiste tu bono' : 'Ya tienes tu bono'}
        </h2>

        <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-4 mb-6 text-sm text-[#C4A97A]">
          {!tieneBono ? (
            <>
              Tu cuenta ya está creada, así que la promoción de bienvenida no aplica: la ruleta es únicamente para
              quienes todavía no están registrados. Consulta tus beneficios activos desde tu cuenta.
            </>
          ) : bonoCanjeado ? (
            <>
              Este premio ya fue entregado en la sede correspondiente. La promoción de bienvenida es de un solo bono por
              persona, así que la ruleta ya no está disponible para tu cuenta.
            </>
          ) : (
            <>
              Tu bono sigue reservado y pendiente de reclamar. La promoción entrega un único bono por persona, por eso
              no puedes volver a girar.
              {codigo && (
                <span className="block mt-3 font-mono tracking-widest text-[#D4AF37] text-base">{codigo}</span>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onVerCuenta}
          className="w-full py-4 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
          style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)', letterSpacing: '0.06em' }}
        >
          Ver mi cuenta
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm text-[#9A7B50] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:text-[#C4A97A] transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

// La ruleta debe girar al menos 5 segundos. Se dejan 5.8 para que la caída de
// la bola y sus rebotes finales se alcancen a apreciar sin que se haga largo.
const DURACION_GIRO_MS = 5800

export default function RoulettePage({ navigate, onPrizeWon }: Props) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [wonPrizeIdx, setWonPrizeIdx] = useState<number | null>(null)
  const [pendingPrizeIdx, setPendingPrizeIdx] = useState<number | null>(null)
  const [prizeTicket, setPrizeTicket] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [spinCommand, setSpinCommand] = useState<RouletteSpinCommand | null>(null)
  const [spinError, setSpinError] = useState<string | null>(null)

  const { cliente, bono, bonoCanjeado, token, loading: authLoading } = useAuth()

  // La ruleta es SOLO para visitantes sin cuenta: es una promocion de
  // captacion. Cualquier cliente con la sesion abierta queda bloqueado, tenga
  // bono o no. Antes se exigia ademas `yaParticipo`, y eso dejaba pasar al
  // cliente registrado sin bono, que giraba y despues no tenia como reclamar
  // (el reclamo pasa por el registro, y su correo ya existia).
  //
  // Se bloquea tambien mientras la sesion se esta restaurando: hasta que /me
  // responde no sabemos si hay cliente detras, y sin esto un clic rapido al
  // entrar directo a /ruleta se colaba antes de la respuesta.
  const giroBloqueado = authLoading || !!cliente
  const [showYaParticipaste, setShowYaParticipaste] = useState(false)

  // Giros que le quedan al visitante. El conteo lo lleva el servidor contra
  // una cookie httpOnly, así que recargar la página NO lo reinicia. Se
  // consulta al entrar para poder mostrarlo sin gastar un giro.
  const [restantes, setRestantes] = useState<number | null>(null)
  const [maximo, setMaximo] = useState<number | null>(null)

  useEffect(() => {
    if (cliente) return // un cliente con sesión no gira: no aplica el contador
    fetchGirosRestantes()
      .then((r) => {
        setRestantes(r.restantes)
        setMaximo(r.maximo)
      })
      .catch(() => {
        // Si falla, no se bloquea al usuario: el servidor rechazará el giro
        // igual si ya no le quedan.
      })
  }, [cliente])

  const sinGiros = restantes === 0

  // El sonido se crea una sola vez y se corta al desmontar, para que no siga
  // sonando si el usuario navega a otra vista a mitad del giro.
  const sonido = useRef(createRouletteSound())
  useEffect(() => {
    const actual = sonido.current
    return () => actual.stop()
  }, [])

  const spin = async () => {
    if (isSpinning || showModal) return

    // Se corta antes de llamar al backend. Mientras carga la sesion no se
    // abre el modal: todavia no hay nada que explicarle al usuario.
    if (giroBloqueado) {
      if (!authLoading) setShowYaParticipaste(true)
      return
    }
    if (sinGiros) {
      setSpinError(`Ya usaste tus ${maximo ?? 3} giros. Regístrate para reclamar el premio que obtuviste.`)
      return
    }

    setSpinError(null)
    setIsSpinning(true)

    // El premio ya NO se decide aquí: el servidor hace el sorteo ponderado
    // real y firma un ticket que se reclama al completar el registro.
    // targetPocket sigue siendo local porque solo controla dónde se detiene
    // visualmente la ruleta 3D (es decorativo, no revela ni afecta el premio).
    let result
    try {
      result = await spinRoulette(token)
      setRestantes(result.restantes)
      setMaximo(result.maximo)
    } catch (error) {
      setIsSpinning(false)
      setSpinError(error instanceof ApiError ? error.message : 'No se pudo girar la ruleta. Intenta de nuevo.')
      // El backend es la autoridad: si rechazó por giros agotados, se
      // sincroniza el contador para que el botón quede coherente.
      void fetchGirosRestantes()
        .then((r) => setRestantes(r.restantes))
        .catch(() => {})
      return
    }

    const targetPocket = Math.floor(Math.random() * TOTAL_POCKETS)
    const targetPrize = PRIZES.findIndex((p) => p.clave === result.premio.clave)

    setWonPrizeIdx(null)
    setPendingPrizeIdx(targetPrize)
    setPrizeTicket(result.ticket)
    setShowModal(false)

    // El sonido se dispara con el mismo comando que la animación para que
    // vayan sincronizados. Va dentro del clic, que es el gesto de usuario que
    // los navegadores exigen para permitir audio.
    sonido.current.spin(DURACION_GIRO_MS)

    setSpinCommand({
      id: Date.now(),
      targetPocket,
      durationMs: DURACION_GIRO_MS,
    })
  }

  const handleSpinComplete = () => {
    if (pendingPrizeIdx === null) return

    setIsSpinning(false)
    setWonPrizeIdx(pendingPrizeIdx)
    setShowConfetti(true)
    sonido.current.win()

    window.setTimeout(() => setShowModal(true), 500)
    window.setTimeout(() => setShowConfetti(false), 4000)
  }

  const handleClaim = () => {
    if (wonPrizeIdx !== null && prizeTicket) {
      onPrizeWon(PRIZES[wonPrizeIdx].prize, prizeTicket)
    }

    setShowModal(false)
    navigate('register')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-28 md:pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden bg-transparent"
      style={{
        background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(139,26,26,0.3) 0%, transparent 60%)',
      }}
    >
      {showConfetti && <Confetti />}
      {showYaParticipaste && (
        <YaParticipasteModal
          tieneBono={!!bono}
          bonoCanjeado={bonoCanjeado}
          codigo={bono?.codigo ?? null}
          onClose={() => setShowYaParticipaste(false)}
          onVerCuenta={() => {
            setShowYaParticipaste(false)
            navigate('dashboard')
          }}
        />
      )}
      {showModal && wonPrizeIdx !== null && (
        <PrizeModal
          segmentIndex={wonPrizeIdx}
          onClaim={handleClaim}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="w-full max-w-lg mb-4 z-10">
        <BackButton />
      </div>

      <div className="text-center mb-1 z-10">
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">
          PROMOCIÓN DE BIENVENIDA
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8]">
          ¡Es tu momento de ganar!
        </h1>
        <p className="text-[#9A7B50] mt-2 text-sm max-w-sm mx-auto">
          Presiona el botón, gira la ruleta y descubre el beneficio que tenemos para ti.
        </p>

        {/* La regla se dice ANTES de girar, no cuando ya se agotaron los
            intentos: el jugador debe saber a qué atenerse desde el principio. */}
        {!cliente && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/8 px-4 py-1.5">
            <Info size={13} className="text-[#D4AF37] flex-shrink-0" />
            <span className="text-xs text-[#C4A97A]">
              {restantes === null || maximo === null ? (
                'Tienes 3 intentos en total'
              ) : restantes === 0 ? (
                <span className="text-[#eab308]">Usaste tus {maximo} intentos</span>
              ) : (
                <>
                  Tienes <strong className="text-[#D4AF37]">{maximo} intentos</strong> en total ·{' '}
                  {restantes === 1 ? 'te queda 1' : `te quedan ${restantes}`}
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* La ruleta ya no usa SVG ni rotateX. La profundidad proviene de geometría real. */}
      <div className="w-full max-w-[860px] h-[390px] sm:h-[500px] md:h-[590px] -mt-2 md:-mt-8 z-0">
        <Roulette3D
          spinCommand={spinCommand}
          onSpinComplete={handleSpinComplete}
          quality="high"
          className="w-full h-full"
        />
      </div>

      <div className="text-center -mt-7 md:-mt-12 z-10">
        <button
          type="button"
          onClick={() => void spin()}
          disabled={isSpinning || showModal || sinGiros}
          className="px-10 py-4 rounded-full font-black text-base tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background:
              isSpinning || giroBloqueado || sinGiros
                ? 'linear-gradient(135deg, #8A7020, #6A5518)'
                : 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
            color: '#0a0805',
            letterSpacing: '0.1em',
            minWidth: 250,
            animation: isSpinning || giroBloqueado || sinGiros ? 'none' : 'pulse-glow 2.5s ease-in-out infinite',
            transform: isSpinning ? 'scale(0.97)' : 'scale(1)',
          }}
        >
          {isSpinning
            ? '⏳ Descubriendo tu premio...'
            : authLoading
            ? 'Cargando...'
            : cliente
            ? 'Ya tienes cuenta'
            : sinGiros
            ? 'Giros agotados'
            : 'Girar Ruleta'}
        </button>

        {spinError && <p className="mt-3 text-red-400 text-xs">{spinError}</p>}

        <p className="mt-3 text-[#6B5D3F] text-xs">
          {cliente ? 'La ruleta es para nuevos jugadores' : 'Un bono por persona'} ·{' '}
          <button
            type="button"
            onClick={() => navigate('terms')}
            className="hover:text-[#9A7B50] transition-colors underline"
          >
            Ver términos
          </button>
        </p>
      </div>

      {/* Se mantiene visible siempre (girando o no) — el jugador debe poder
          seguir viendo todos los premios en juego en todo momento. */}
      <div className="mt-10 max-w-lg w-full z-10 relative">
        <p className="text-center text-[#6B5D3F] text-xs mb-4 tracking-wider uppercase">
          Premios en juego
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRIZES.map((prize) => (
            <div
              key={prize.clave}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D4AF37]/10 text-xs text-[#9A7B50]"
              style={{ background: 'rgba(18,16,9,0.7)', backdropFilter: 'blur(4px)' }}
            >
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: prize.color }} />
              <span className="truncate">{prize.label} {prize.sublabel}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full -mx-4 sm:-mx-6 mt-auto pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}