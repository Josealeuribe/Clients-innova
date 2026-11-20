import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import {
  Ban,
  Beer,
  CalendarX,
  CircleCheck,
  Clock,
  HandCoins,
  HeartHandshake,
  PiggyBank,
  RotateCcw,
  ShieldAlert,
  Smile,
  Timer,
  UserX,
  Users,
  Wallet,
} from 'lucide-react'
import BackButton from '@/shared/components/BackButton'
import InfoPageShell, { Panel } from '@/shared/components/info/InfoPageShell'
import PageHero from '@/shared/components/info/PageHero'
import AyudaJuegoPanel from '@/shared/components/info/AyudaJuegoPanel'
import { LINEA_PRINCIPAL } from '@/shared/data/ayuda'

interface Props {
  navigate: (page: Page) => void
}

const CONSEJOS = [
  { icono: Wallet, titulo: 'Define un presupuesto', texto: 'Decide antes de entrar cuánto vas a gastar y no lo superes. Ese dinero es el precio de tu entretenimiento.' },
  { icono: Timer, titulo: 'Ponle hora de salida', texto: 'Fija cuánto tiempo vas a jugar y haz pausas. Pon una alarma en tu celular.' },
  { icono: RotateCcw, titulo: 'No persigas pérdidas', texto: 'Lo que se perdió, se perdió. Jugar más para recuperarlo es la forma más rápida de perder más.' },
  { icono: PiggyBank, titulo: 'Nunca con dinero esencial', texto: 'No juegues con lo del arriendo, la comida, las deudas o el dinero de otros. Nunca pidas prestado para jugar.' },
  { icono: Beer, titulo: 'Con la cabeza fría', texto: 'Evita jugar bajo efectos del alcohol o cuando estás triste, estresado o enojado.' },
  { icono: Smile, titulo: 'Es entretenimiento', texto: 'El juego no es una fuente de ingresos ni una salida a problemas económicos.' },
]

// Preguntas de autoevaluación, adaptadas de cribados de juego problemático de
// uso público (tipo PGSI / Lie-Bet). Es orientativa: no diagnostica nada, y así
// se le dice a quien la responde.
const PREGUNTAS = [
  '¿Has apostado más dinero del que podías permitirte perder?',
  '¿Has necesitado jugar con más dinero para sentir la misma emoción?',
  '¿Has vuelto otro día para intentar recuperar lo que perdiste?',
  '¿Has pedido prestado o vendido algo para conseguir dinero para jugar?',
  '¿Has sentido que podrías tener un problema con el juego?',
  '¿Le has mentido a tu familia o amigos sobre cuánto juegas?',
  '¿El juego te ha causado estrés, ansiedad o problemas en casa o en el trabajo?',
  '¿Te has sentido culpable por la forma en que juegas o por lo que pasa cuando juegas?',
]

const AUTOEXCLUSION = [
  { icono: UserX, titulo: 'Acércate a caja', texto: 'En cualquiera de nuestras 3 sedes, con tu documento de identidad.' },
  { icono: CalendarX, titulo: 'Elige el tiempo', texto: 'Decide por cuánto tiempo quieres que no te permitamos el ingreso a las salas de juego.' },
  { icono: Ban, titulo: 'Te acompañamos', texto: 'Durante ese tiempo te ayudamos a mantener la distancia de las salas de juego. El personal de caja te explica las condiciones.' },
]

export default function ResponsibleGamingPage({ navigate }: Props) {
  return (
    <InfoPageShell navigate={navigate} back={<BackButton />}>
      <PageHero
        eyebrow="GRAN CASINO CÚCUTA"
        title="Juego"
        highlight="Responsable"
        icon={HeartHandshake}
        subtitle="El juego es para divertirse. Cuando deja de ser diversión, es momento de parar y pedir ayuda. Aquí encuentras cómo jugar de forma segura y a quién acudir."
      >
        <div className="flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#B52020]/50 bg-[#B52020]/10 px-4 py-1.5 text-xs font-bold text-[#F5E6C8]">
            <ShieldAlert size={14} className="text-[#F0C847]" /> Prohibido para menores de 18 años
          </span>
          <a
            href={`tel:${LINEA_PRINCIPAL.tel}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-bold text-[#F0C847] hover:bg-[#D4AF37]/20"
          >
            <HeartHandshake size={14} /> ¿Necesitas ayuda? Llama al {LINEA_PRINCIPAL.numero}
          </a>
        </div>
      </PageHero>

      {/* ---------- Consejos ---------- */}
      <section className="mb-16">
        <TituloSeccion eyebrow="ANTES DE JUGAR" titulo="Juega con límites" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CONSEJOS.map(({ icono: Icono, titulo, texto }) => (
            <Panel key={titulo}>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/8 text-[#F0C847]">
                <Icono size={22} />
              </span>
              <h3 className="font-display mb-2 text-xl font-bold text-[#F5E6C8]">{titulo}</h3>
              <p className="text-sm leading-relaxed text-[#C4A97A]">{texto}</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* ---------- Autoevaluación ---------- */}
      <section className="mb-16">
        <TituloSeccion
          eyebrow="SEÑALES DE ALERTA"
          titulo="¿El juego sigue siendo un juego?"
          descripcion="Responde con sinceridad pensando en los últimos 12 meses. Nadie más ve tus respuestas: no se guardan ni se envían."
        />
        <Autoevaluacion />
      </section>

      {/* ---------- Ayuda ---------- */}
      <section className="mb-16" id="ayuda">
        <AyudaJuegoPanel />
      </section>

      {/* ---------- Autoexclusión ---------- */}
      <section className="mb-16">
        <TituloSeccion
          eyebrow="TÓMATE UNA PAUSA"
          titulo="Autoexclusión"
          descripcion="Si necesitas alejarte de las salas de juego por un tiempo o de forma definitiva, puedes pedirlo. Es tu decisión y la respetamos."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {AUTOEXCLUSION.map(({ icono: Icono, titulo, texto }, i) => (
            <Panel key={titulo}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-display text-3xl font-black text-[#D4AF37]/40">{String(i + 1).padStart(2, '0')}</span>
                <Icono size={22} className="text-[#F0C847]" />
              </div>
              <h3 className="font-display mb-1 text-xl font-bold text-[#F5E6C8]">{titulo}</h3>
              <p className="text-sm leading-relaxed text-[#C4A97A]">{texto}</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* ---------- Menores y familia ---------- */}
      <section className="grid gap-5 md:grid-cols-2">
        <Panel tono="alerta">
          <div className="flex gap-4">
            <ShieldAlert size={26} className="flex-shrink-0 text-[#F0C847]" />
            <div>
              <h3 className="font-display mb-2 text-xl font-bold text-[#F5E6C8]">Menores de edad</h3>
              <p className="text-sm leading-relaxed text-[#E0CDB0]">
                Nuestras sedes, salas y promociones son exclusivas para mayores de 18 años. Solicitamos documento de
                identidad y podemos verificarlo en cualquier momento. Si eres padre o madre, protege tus dispositivos
                con controles parentales.
              </p>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="flex gap-4">
            <Users size={26} className="flex-shrink-0 text-[#F0C847]" />
            <div>
              <h3 className="font-display mb-2 text-xl font-bold text-[#F5E6C8]">Si te preocupa alguien cercano</h3>
              <p className="text-sm leading-relaxed text-[#C4A97A]">
                Habla con calma y sin juzgar, no le prestes dinero para jugar ni pagues sus deudas de juego, y anímale a
                llamar a una línea de ayuda. Tú también puedes llamar para recibir orientación.
              </p>
            </div>
          </div>
        </Panel>
      </section>
    </InfoPageShell>
  )
}

function TituloSeccion({ eyebrow, titulo, descripcion }: { eyebrow: string; titulo: string; descripcion?: string }) {
  return (
    <div className="mb-8 text-center">
      <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-[#D4AF37]">{eyebrow}</p>
      <h2 className="font-display text-3xl font-black text-[#F5E6C8] md:text-4xl">{titulo}</h2>
      {descripcion && <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#C4A97A]">{descripcion}</p>}
    </div>
  )
}

function Autoevaluacion() {
  const [respuestas, setRespuestas] = useState<(boolean | null)[]>(() => PREGUNTAS.map(() => null))
  const contestadas = respuestas.filter((r) => r !== null).length
  const si = respuestas.filter((r) => r === true).length
  const completa = contestadas === PREGUNTAS.length

  const responder = (i: number, valor: boolean) =>
    setRespuestas((prev) => prev.map((r, j) => (j === i ? valor : r)))

  // 0 = sin señales; 1-2 = atención; 3+ = buscar ayuda.
  const nivel = si === 0 ? 'bien' : si <= 2 ? 'atencion' : 'ayuda'
  const resultado = {
    bien: { color: '#4ADE80', titulo: 'No aparecen señales de riesgo', texto: 'Sigue jugando con límites de tiempo y dinero, y vuelve a hacerte estas preguntas de vez en cuando.' },
    atencion: { color: '#EAB308', titulo: 'Hay algunas señales de alerta', texto: 'Presta atención a tus hábitos de juego: pon límites más estrictos y considera hablar con un profesional. Llamar es gratis y confidencial.' },
    ayuda: { color: '#F87171', titulo: 'Es momento de pedir ayuda', texto: 'Tus respuestas muestran varias señales de juego problemático. No tienes que manejarlo solo: llama hoy a una línea de ayuda o pide tu autoexclusión en caja.' },
  }[nivel]

  return (
    <Panel tono="oro">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-[0.18em] text-[#D4AF37]">AUTOEVALUACIÓN RÁPIDA</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9A7B50]">
            {contestadas}/{PREGUNTAS.length}
          </span>
          {contestadas > 0 && (
            <button type="button" onClick={() => setRespuestas(PREGUNTAS.map(() => null))} className="text-xs text-[#9A7B50] underline hover:text-[#D4AF37]">
              Reiniciar
            </button>
          )}
        </div>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#D4AF37]/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#A0832A] to-[#F0C847] transition-all duration-500" style={{ width: `${(contestadas / PREGUNTAS.length) * 100}%` }} />
      </div>

      <ol className="grid gap-3 lg:grid-cols-2">
        {PREGUNTAS.map((pregunta, i) => (
          <li key={pregunta} className="flex flex-col gap-3 rounded-xl border border-[#D4AF37]/15 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-[#F5E6C8]">
              <span className="font-display mr-2 font-black text-[#D4AF37]/60">{i + 1}.</span>
              {pregunta}
            </span>
            <div className="flex flex-shrink-0 gap-2">
              {[
                { valor: true, etiqueta: 'Sí' },
                { valor: false, etiqueta: 'No' },
              ].map(({ valor, etiqueta }) => {
                const on = respuestas[i] === valor
                return (
                  <button
                    key={etiqueta}
                    type="button"
                    aria-pressed={on}
                    onClick={() => responder(i, valor)}
                    className={`min-w-14 rounded-lg border px-4 py-1.5 text-sm font-bold transition-all ${
                      on
                        ? valor
                          ? 'border-[#B52020] bg-[#B52020]/25 text-[#F5E6C8]'
                          : 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F0C847]'
                        : 'border-[#D4AF37]/20 text-[#9A7B50] hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {etiqueta}
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ol>

      {/* El resultado aparece con 3 "sí" aunque falten preguntas: no tiene
          sentido hacer esperar a quien ya mostró que necesita ayuda. */}
      {(completa || si >= 3) && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${resultado.color}66`, background: `${resultado.color}12` }}>
          <div className="flex gap-3">
            {nivel === 'bien' ? (
              <CircleCheck size={24} className="flex-shrink-0" style={{ color: resultado.color }} />
            ) : (
              <HandCoins size={24} className="flex-shrink-0" style={{ color: resultado.color }} />
            )}
            <div>
              <p className="font-display mb-1 text-lg font-bold" style={{ color: resultado.color }}>
                {resultado.titulo}
              </p>
              <p className="text-sm leading-relaxed text-[#E0CDB0]">{resultado.texto}</p>
            </div>
          </div>
          {nivel !== 'bien' && (
            <a
              href="#ayuda"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('ayuda')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#1a1408]"
              style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
            >
              <HeartHandshake size={16} /> Ver líneas de ayuda
            </a>
          )}
        </div>
      )}
      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#6B5D3F]">
        <Clock size={12} /> Orientativa: no reemplaza la valoración de un profesional de la salud.
      </p>
    </Panel>
  )
}
