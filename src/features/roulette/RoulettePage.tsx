import { useEffect, useRef, useState } from 'react'
import { X, CircleCheck, Lock, Info, CalendarClock, Gift, Sparkles, Crown } from 'lucide-react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
// RULETA 3D DESACTIVADA (noviembre de 2026). Esta vista ahora juega con la
// tragamonedas 3D. El código de la ruleta NO se borró: Roulette3D.tsx, sus
// tipos y constantes siguen intactos, y su uso en esta página quedó comentado
// más abajo (busca "RULETA 3D"). Para volver a ella: descomentar estos tres
// imports y el bloque <Roulette3D />, y restaurar la lógica de spinCommand.
// import { RouletteSpinCommand } from './types/roulette.types'
// import { TOTAL_POCKETS } from './constants/roulette.constants'
// import Roulette3D from './components/Roulette3D'
import SlotMachine3D, {
  combinacionPara,
  type GiroTragamonedas,
} from '../landing/components/SlotMachine3D'
import { PRIZES } from '@/shared/data/prizes'
import { spinRoulette, fetchGirosRestantes, ApiError } from '@/shared/api/client'
import { createRouletteSound } from '@/shared/audio/rouletteSound'
import { useVigencias } from '@/shared/hooks/useVigencias'
import { useBloquearScroll } from '@/shared/hooks/useBloquearScroll'
import { VigenciaResumen } from '@/shared/components/VigenciaPromocion'
import VigenciaBoletos from './components/VigenciaBoletos'
import { formatVigencia } from '@/shared/utils/vigencia'
import { usePremioPendiente } from '@/shared/context/PremioPendienteContext'
import fichardoBono from '@/shared/assets/images/fichardo-bono.png'

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
  /**
   * Hasta cuándo se puede redimir ESTE premio. Null si la consulta de vigencias
   * no alcanzó a responder: en ese caso no se dice ninguna fecha, en vez de
   * inventarse una que después no se cumpla.
   */
  vigenciaHasta: string | null
  /** Giros que le quedan: si hay, el modal ofrece seguir girando. */
  restantes: number
  /**
   * Si en este giro salió un premio MENOR que el que ya tenía, cuál fue: el
   * visitante conserva el mejor y se le dice.
   */
  premioMenor: string | null
  onClaim: () => void
  onClose: () => void
  /** Sale a la vista de términos conservando el premio, para poder volver. */
  onVerCondiciones: () => void
}

function PrizeModal({ segmentIndex, vigenciaHasta, restantes, premioMenor, onClaim, onClose, onVerCondiciones }: PrizeModalProps) {
  // Un índice guardado en la sesión antes de retirar premios puede quedar
  // fuera del catálogo: se muestra el bono de $10.000, que es lo que el backend
  // entrega en ese caso.
  const prize = PRIZES[segmentIndex] ?? PRIZES[0]
  const { monetary } = prize

  // Congela la pagina de atras: sin esto la rueda del raton seguia desplazando
  // el contenido detras del modal. Mismo criterio en los tres modales de esta
  // vista, para que se comporten igual.
  useBloquearScroll(true)

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
        {premioMenor && (
          <p className="text-xs text-[#C4A97A] mt-2">
            Esta vez salió un {premioMenor}, pero conservas tu premio mayor.
          </p>
        )}

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

        {/* La fecha límite se dice en el momento en que se gana, no solo en el
            panel de después: es parte de la condición del premio que se acaba
            de prometer. Sale de la base, así que extender la promoción la
            actualiza aquí sin tocar este archivo. */}
        {vigenciaHasta && (
          <div className="flex items-center justify-center gap-2 mb-6 -mt-3">
            <CalendarClock size={13} className="text-[#D4AF37] flex-shrink-0" />
            <p className="text-xs text-[#C4A97A]">
              Válido para redimir hasta el{' '}
              <strong className="text-[#D4AF37]">{formatVigencia(vigenciaHasta)}</strong>
            </p>
          </div>
        )}

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

        {/* Seguir girando NO renuncia al premio: se conserva y, si en los
            giros que quedan sale uno mayor, se cambia por ese. */}
        {restantes > 0 && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all mb-3"
          >
            Seguir girando · {restantes === 1 ? 'te queda 1 giro' : `te quedan ${restantes} giros`}
          </button>
        )}

        {/* Antes esto llamaba a onClose, es decir, solo cerraba el modal: el
            botón decía "Ver condiciones" y no llevaba a ninguna parte. Ahora
            abre los términos de verdad, conservando el premio para poder
            volver a este mismo modal y reclamarlo (ver
            PremioPendienteContext). */}
        <button
          type="button"
          onClick={onVerCondiciones}
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
// tragamonedas no vuelve a girar: se le explica por que en vez de dejarlo girar y
// fallar despues al reclamar.
function YaParticipasteModal({ tieneBono, bonoCanjeado, codigo, onClose, onVerCuenta }: YaParticipasteModalProps) {
  useBloquearScroll(true)

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
          {!tieneBono ? 'La tragamonedas es para nuevos jugadores' : bonoCanjeado ? 'Ya redimiste tu bono' : 'Ya tienes tu bono'}
        </h2>

        <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-4 mb-6 text-sm text-[#C4A97A]">
          {!tieneBono ? (
            <>
              Tu cuenta ya está creada, así que la promoción de bienvenida no aplica: la tragamonedas es únicamente para
              quienes todavía no están registrados. Consulta tus beneficios activos desde tu cuenta.
            </>
          ) : bonoCanjeado ? (
            <>
              Este premio ya fue entregado en la sede correspondiente. La promoción de bienvenida es de un solo bono por
              persona, así que la tragamonedas ya no está disponible para tu cuenta.
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

// RULETA 3D (desactivada): la ruleta giraba 5.8 s para que se apreciara la
// caída de la bola.
// const DURACION_GIRO_MS = 5800

// Lo que tarda la tragamonedas en detener el tercer rodillo en el modo
// controlado (palanca 0.35 s + 2.4 s + 2 × 0.75 s, ver SlotMachine3D). El
// sonido de giro se programa con esta duración.
const DURACION_GIRO_MS = 4300

// Giros por visitante si el servidor todavía no respondió. La cifra real
// manda (GIROS_MAXIMOS en server/src/routes/ruleta.routes.ts).
const GIROS_POR_DEFECTO = 5

// La tabla de pagos, tal cual la ve el cliente. Las claves conectan con el
// catálogo (PRIZES) y con los símbolos de la máquina (SIMBOLO_DE_PREMIO).
const TABLA_DE_PAGOS = [
  { clave: 'bono-10000', simbolo: '🍒', nombre: 'Tres cerezas', etiqueta: 'El más frecuente' },
  { clave: 'bono-20000', simbolo: '🔔', nombre: 'Tres campanas', etiqueta: 'Menos frecuente' },
  { clave: 'bono-50000', simbolo: '7', nombre: 'Tres sietes', etiqueta: 'Premio mayor' },
] as const

function SimboloPago({ simbolo, className = '' }: { simbolo: string; className?: string }) {
  if (simbolo === '7') {
    return (
      <span
        className={`font-display font-black leading-none ${className}`}
        style={{
          color: '#E5281D',
          WebkitTextStroke: '1px #A0832A',
          textShadow: '0 0 12px rgba(229,40,29,0.45)',
        }}
      >
        7
      </span>
    )
  }
  return <span className={`leading-none ${className}`}>{simbolo}</span>
}

interface ResultadoPendiente {
  /** Índice en PRIZES, o null si el giro salió sin premio. */
  premioIdx: number | null
  ticket: string | null
}

export default function RoulettePage({ navigate, onPrizeWon }: Props) {
  // Premio ganado y aún sin reclamar. Vive por encima de esta vista para que
  // salir a los términos y volver no lo pierda (ver PremioPendienteContext).
  const { premioPendiente, recordar, olvidar } = usePremioPendiente()

  const [isSpinning, setIsSpinning] = useState(false)
  // El MEJOR premio ganado hasta ahora (el que se reclama). Arranca de lo que
  // haya guardado: si el visitante vuelve de leer las condiciones, la vista se
  // monta de nuevo y así reaparece su premio.
  const [wonPrizeIdx, setWonPrizeIdx] = useState<number | null>(premioPendiente?.segmentIndex ?? null)
  const [prizeTicket, setPrizeTicket] = useState<string | null>(premioPendiente?.ticket ?? null)
  const [pendiente, setPendiente] = useState<ResultadoPendiente | null>(null)
  const [premioMenor, setPremioMenor] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(premioPendiente !== null)
  const [showConfetti, setShowConfetti] = useState(false)
  // RULETA 3D: const [spinCommand, setSpinCommand] = useState<RouletteSpinCommand | null>(null)
  const [giro, setGiro] = useState<GiroTragamonedas | null>(null)
  const [spinError, setSpinError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const { cliente, bono, bonoCanjeado, token, loading: authLoading } = useAuth()

  // Hasta cuándo se puede redimir cada premio. Se consulta al entrar, no al
  // ganar: el visitante debe poder ver la fecha ANTES de decidir si gira.
  const { datos: vigencias, error: vigenciasError } = useVigencias()

  // La tragamonedas es SOLO para visitantes sin cuenta: es una promocion de
  // captacion. Cualquier cliente con la sesion abierta queda bloqueado, tenga
  // bono o no. Tambien mientras la sesion se esta restaurando: hasta que /me
  // responde no sabemos si hay cliente detras.
  const giroBloqueado = authLoading || !!cliente
  const [showYaParticipaste, setShowYaParticipaste] = useState(false)

  // Giros que le quedan al visitante. El conteo lo lleva el servidor, así que
  // recargar la página NO lo reinicia.
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
  const totalGiros = maximo ?? GIROS_POR_DEFECTO
  const usados = restantes === null ? 0 : totalGiros - restantes

  // El sonido se crea una sola vez y se corta al desmontar.
  const sonido = useRef(createRouletteSound())
  useEffect(() => {
    const actual = sonido.current
    return () => actual.stop()
  }, [])

  const spin = async () => {
    if (isSpinning || showModal) return

    if (giroBloqueado) {
      if (!authLoading) setShowYaParticipaste(true)
      return
    }
    if (sinGiros) {
      setSpinError(
        wonPrizeIdx !== null
          ? `Ya usaste tus ${totalGiros} giros. Reclama el premio que obtuviste.`
          : `Ya usaste tus ${totalGiros} giros.`,
      )
      return
    }

    setSpinError(null)
    setMensaje(null)
    setIsSpinning(true)

    // El resultado lo decide el servidor: si el giro gana y qué bono. La
    // máquina solo anima hasta la combinación que corresponde.
    let result
    try {
      result = await spinRoulette(token)
      setRestantes(result.restantes)
      setMaximo(result.maximo)
    } catch (error) {
      setIsSpinning(false)
      setSpinError(error instanceof ApiError ? error.message : 'No se pudo girar la máquina. Intenta de nuevo.')
      void fetchGirosRestantes()
        .then((r) => setRestantes(r.restantes))
        .catch(() => {})
      return
    }

    // Una clave fuera del catálogo es un premio retirado: el registro lo
    // convierte en el bono de $10.000 (PRIZES[0]), así que eso es lo que se muestra.
    const clave = result.premio?.clave ?? null
    const premioIdx = clave === null ? null : Math.max(0, PRIZES.findIndex((p) => p.clave === clave))
    setPendiente({ premioIdx, ticket: result.ticket })

    sonido.current.spin(DURACION_GIRO_MS)

    // RULETA 3D:
    // const targetPocket = Math.floor(Math.random() * TOTAL_POCKETS)
    // setSpinCommand({ id: Date.now(), targetPocket, durationMs: DURACION_GIRO_MS })
    setGiro({
      id: Date.now(),
      simbolos: combinacionPara(premioIdx === null ? null : PRIZES[premioIdx].clave),
    })
  }

  const handleSpinComplete = () => {
    if (!pendiente) return
    setIsSpinning(false)
    const { premioIdx, ticket } = pendiente
    setPendiente(null)

    if (premioIdx === null || !ticket) {
      sonido.current.stop()
      const quedan = restantes ?? 0
      setMensaje(
        quedan > 0
          ? `Esta vez no hubo combinación ganadora. ${quedan === 1 ? 'Te queda 1 giro' : `Te quedan ${quedan} giros`}, ¡sigue intentando!`
          : wonPrizeIdx !== null
          ? 'Esta vez no hubo combinación ganadora. Ya usaste tus giros: reclama tu premio.'
          : 'Esta vez no hubo combinación ganadora.',
      )
      return
    }

    // Puede salir un segundo premio: se conserva el MAYOR (un cliente
    // reclama un solo bono).
    const nuevo = PRIZES[premioIdx] ?? PRIZES[0]
    const actual = wonPrizeIdx === null ? null : PRIZES[wonPrizeIdx] ?? PRIZES[0]
    if (!actual || nuevo.amount >= actual.amount) {
      setWonPrizeIdx(premioIdx)
      setPrizeTicket(ticket)
      setPremioMenor(null)
      recordar({ segmentIndex: premioIdx, ticket })
    } else {
      setPremioMenor(nuevo.prize)
    }

    setShowConfetti(true)
    sonido.current.win()
    window.setTimeout(() => setShowModal(true), 600)
    window.setTimeout(() => setShowConfetti(false), 4000)
  }

  const handleClaim = () => {
    if (wonPrizeIdx !== null && prizeTicket) {
      onPrizeWon((PRIZES[wonPrizeIdx] ?? PRIZES[0]).prize, prizeTicket)
    }
    // Ya pasó al registro, que lleva su propia copia del premio y del ticket.
    olvidar()
    setShowModal(false)
    navigate('register')
  }

  // Cerrar el modal ya NO es renunciar: con varios giros, el visitante puede
  // seguir jugando y su premio queda guardado (botón "Reclamar" de abajo).
  const handleCerrarModal = () => {
    setShowModal(false)
    setPremioMenor(null)
  }

  // Salir a leer las condiciones tampoco es renunciar.
  const handleVerCondiciones = () => {
    setShowModal(false)
    navigate('terms')
  }

  const premioGanado = wonPrizeIdx === null ? null : PRIZES[wonPrizeIdx] ?? PRIZES[0]

  const textoBoton = isSpinning
    ? 'Girando...'
    : authLoading
    ? 'Cargando...'
    : cliente
    ? 'Ya tienes cuenta'
    : sinGiros
    ? 'Giros agotados'
    : 'Girar'

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
          vigenciaHasta={
            vigencias?.vigencias.find((v) => v.clave === (PRIZES[wonPrizeIdx] ?? PRIZES[0]).clave)?.vigenciaHasta ?? null
          }
          restantes={restantes ?? 0}
          premioMenor={premioMenor}
          onClaim={handleClaim}
          onClose={handleCerrarModal}
          onVerCondiciones={handleVerCondiciones}
        />
      )}

      <div className="w-full max-w-6xl mb-4 z-10">
        <BackButton />
      </div>

      <div className="text-center mb-2 z-10">
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">PROMOCIÓN DE BIENVENIDA</p>
        <h1 className="text-3xl md:text-5xl font-black text-[#F5E6C8]">¡Es tu momento de ganar!</h1>
        <p className="text-[#9A7B50] mt-2 text-sm md:text-base max-w-xl mx-auto">
          Presiona <strong className="text-[#D4AF37]">Girar</strong> o tira de la palanca. Si en la línea roja caen
          tres símbolos iguales, ganas el bono de esa combinación.
        </p>
        <div className="mt-3 flex justify-center">
          <VigenciaResumen datos={vigencias} error={vigenciasError} variante="chip" />
        </div>
      </div>

      <div className="w-full max-w-6xl grid gap-6 lg:gap-10 lg:grid-cols-[1.35fr_1fr] items-center z-10">
        {/* ---------------- Máquina + botón ---------------- */}
        <div className="flex flex-col items-center">
          <div className="relative w-full h-[400px] sm:h-[500px] md:h-[580px]">
            {/* RULETA 3D (desactivada, ver el comentario de los imports):
            <Roulette3D
              spinCommand={spinCommand}
              onSpinComplete={handleSpinComplete}
              quality="high"
              className="w-full h-full"
            />
            */}
            <SlotMachine3D
              className="w-full h-full"
              giro={giro}
              onGiroCompleto={handleSpinComplete}
              onPalanca={() => void spin()}
            />

            {/* Fichardo con su bono, al costado izquierdo de la máquina (la
                palanca va a la derecha). Decorativo y sin clics. */}
            <img
              src={fichardoBono}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="pointer-events-none select-none absolute z-10 left-0 bottom-[2%] w-[26%] max-w-[190px] min-w-[90px] fichardo-flota drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
            />
          </div>

          <button
            type="button"
            onClick={() => void spin()}
            disabled={isSpinning || showModal || sinGiros}
            className="-mt-2 px-12 py-4 rounded-full font-black text-lg tracking-[0.15em] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background:
                isSpinning || giroBloqueado || sinGiros
                  ? 'linear-gradient(135deg, #8A7020, #6A5518)'
                  : 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
              color: '#0a0805',
              minWidth: 250,
              animation: isSpinning || giroBloqueado || sinGiros ? 'none' : 'pulse-glow 2.5s ease-in-out infinite',
              transform: isSpinning ? 'scale(0.97)' : 'scale(1)',
            }}
          >
            {textoBoton.toUpperCase()}
          </button>

          {/* Resultado del último giro / errores */}
          <div className="min-h-[28px] mt-3 text-center" aria-live="polite">
            {spinError && <p className="text-red-400 text-sm">{spinError}</p>}
            {!spinError && mensaje && <p className="text-[#C4A97A] text-sm">{mensaje}</p>}
          </div>

          {/* El premio queda a la mano mientras sigue jugando. */}
          {premioGanado && !showModal && (
            <div
              className="mt-2 w-full max-w-md flex items-center gap-3 rounded-2xl border border-[#D4AF37]/45 px-4 py-3"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(18,16,9,0.9))' }}
            >
              <Gift size={26} className="text-[#D4AF37] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#D4AF37]">TU PREMIO</p>
                <p className="text-[#F5E6C8] font-bold truncate">{premioGanado.prize}</p>
              </div>
              <button
                type="button"
                onClick={handleClaim}
                className="rounded-xl px-4 py-2 text-sm font-bold text-[#0a0805]"
                style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
              >
                Reclamar
              </button>
            </div>
          )}

          <p className="mt-3 text-[#6B5D3F] text-xs">
            {cliente ? 'La tragamonedas es para nuevos jugadores' : 'Un bono por persona'} ·{' '}
            <button
              type="button"
              onClick={() => navigate('terms')}
              className="hover:text-[#9A7B50] transition-colors underline"
            >
              Ver términos
            </button>
          </p>
        </div>

        {/* ---------------- Tabla de premios + giros ---------------- */}
        <div className="flex flex-col gap-5">
          <section
            className="rounded-3xl border border-[#D4AF37]/30 p-5 md:p-6"
            style={{ background: 'linear-gradient(160deg, #1C1810 0%, #121009 100%)' }}
            aria-labelledby="tabla-pagos"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-[#D4AF37]" />
              <h2 id="tabla-pagos" className="text-[#D4AF37] text-xs font-bold tracking-[0.3em]">
                TABLA DE PREMIOS
              </h2>
            </div>
            <p className="text-sm text-[#9A7B50] mb-4">
              Ganas cuando los <strong className="text-[#C4A97A]">tres rodillos</strong> muestran el mismo símbolo
              sobre la <strong className="text-[#E5281D]">línea roja</strong>.
            </p>

            <ul className="flex flex-col gap-3">
              {TABLA_DE_PAGOS.map((fila) => {
                const premio = PRIZES.find((p) => p.clave === fila.clave)
                const mayor = fila.clave === 'bono-50000'
                return (
                  <li
                    key={fila.clave}
                    className="relative flex items-center gap-3 rounded-2xl border px-3 py-3"
                    style={{
                      borderColor: mayor ? 'rgba(181,32,32,0.6)' : 'rgba(212,175,55,0.22)',
                      background: mayor
                        ? 'linear-gradient(135deg, rgba(181,32,32,0.18), rgba(212,175,55,0.08))'
                        : 'rgba(10,8,5,0.55)',
                    }}
                  >
                    {/* Los tres símbolos, como se ven en la máquina */}
                    <div className="flex gap-1 flex-shrink-0">
                      {[0, 1, 2].map((k) => (
                        <span
                          key={k}
                          className="w-10 h-11 md:w-11 md:h-12 rounded-lg flex items-center justify-center text-2xl md:text-[28px]"
                          style={{
                            background: 'linear-gradient(180deg, #E9E2D2, #FFFDF7 50%, #E9E2D2)',
                            boxShadow: 'inset 0 0 0 1px rgba(160,131,42,0.55)',
                          }}
                        >
                          <SimboloPago simbolo={fila.simbolo} />
                        </span>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#9A7B50]">{fila.nombre}</p>
                      <p className="font-display text-xl md:text-2xl font-black text-[#F5E6C8] leading-tight">
                        Bono ${premio ? premio.amount.toLocaleString('es-CO') : ''}
                      </p>
                    </div>
                    <span
                      className="hidden sm:flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold tracking-wider whitespace-nowrap"
                      style={
                        mayor
                          ? { background: '#B52020', color: '#F5E6C8' }
                          : { background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }
                      }
                    >
                      {mayor && <Crown size={10} />}
                      {fila.etiqueta.toUpperCase()}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 text-xs text-[#6B5D3F]">
              Cualquier otra combinación no tiene premio. Todos los bonos se redimen en caja, en cualquiera de
              nuestras 3 sedes.
            </p>
          </section>

          {/* Giros: la regla se dice ANTES de girar. */}
          {!cliente && (
            <section
              className="rounded-3xl border border-[#D4AF37]/25 p-5"
              style={{ background: 'rgba(18,16,9,0.85)' }}
              aria-label="Tus giros"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Info size={15} className="text-[#D4AF37]" />
                  <p className="text-sm font-bold text-[#F5E6C8]">Tienes {totalGiros} giros en total</p>
                </div>
                <p className="text-xs text-[#C4A97A]">
                  {restantes === null
                    ? ''
                    : restantes === 0
                    ? 'Sin giros'
                    : restantes === 1
                    ? 'Te queda 1'
                    : `Te quedan ${restantes}`}
                </p>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: totalGiros }, (_, i) => {
                  const gastado = i < usados
                  return (
                    <span
                      key={i}
                      className="flex-1 h-9 rounded-xl flex items-center justify-center text-xs font-black"
                      style={
                        gastado
                          ? { background: 'rgba(255,255,255,0.04)', color: '#4A4030', border: '1px solid rgba(212,175,55,0.1)' }
                          : { background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)', color: '#0a0805' }
                      }
                      aria-label={gastado ? `Giro ${i + 1} usado` : `Giro ${i + 1} disponible`}
                    >
                      {i + 1}
                    </span>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-[#9A7B50]">
                Si ganas, puedes reclamar tu bono de una vez o seguir girando: si sale uno mayor, te quedas con el
                mayor. Un bono por persona.
              </p>
            </section>
          )}
        </div>
      </div>

      {/* El registro completo: qué premio se redime hasta cuándo, como boletos
          en miniatura. La tabla anterior era:
          <RegistroVigencias datos={vigencias} error={vigenciasError}
            titulo="Hasta cuándo puedes redimir"
            descripcion="Cada premio tiene su propia fecha límite. Estas son las condiciones vigentes de la promoción." /> */}
      <div className="mt-10 max-w-5xl w-full z-10 relative">
        <VigenciaBoletos datos={vigencias} error={vigenciasError} claveDestacada={premioGanado?.clave ?? null} />
      </div>

      <div className="w-full -mx-4 sm:-mx-6 mt-auto pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
