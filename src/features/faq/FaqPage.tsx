import { useMemo, useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { HelpCircle, MessageCircleQuestion, Plus, Search } from 'lucide-react'
import BackButton from '@/shared/components/BackButton'
import InfoPageShell, { Panel } from '@/shared/components/info/InfoPageShell'
import PageHero from '@/shared/components/info/PageHero'
import PremiosResumen from '@/shared/components/info/PremiosResumen'
import AyudaJuegoPanel from '@/shared/components/info/AyudaJuegoPanel'
import { FAQ_CATEGORIAS, FAQ_ITEMS, type FaqCategoria } from '@/shared/data/faq'

interface Props {
  navigate: (page: Page) => void
}

// Quita tildes y mayúsculas para que "cuantos" encuentre "¿Cuántos...?".
const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export default function FaqPage({ navigate }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<FaqCategoria | 'todas'>('todas')
  const [abierta, setAbierta] = useState<string | null>(FAQ_ITEMS[0]?.question ?? null)

  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim())
    return FAQ_ITEMS.filter(
      (item) =>
        (categoria === 'todas' || item.categoria === categoria) &&
        (!q || normalizar(item.question).includes(q) || normalizar(item.answer).includes(q)),
    )
  }, [busqueda, categoria])

  return (
    <InfoPageShell navigate={navigate} back={<BackButton />} ancho="lectura">
      <PageHero
        eyebrow="RESOLVEMOS TUS DUDAS"
        title="Preguntas"
        highlight="Frecuentes"
        icon={MessageCircleQuestion}
        subtitle="Todo sobre la promoción Gira y Gana, los bonos, tu cuenta y nuestras sedes."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* ---------- Buscador y filtros ---------- */}
          <div className="relative mb-4">
            <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9A7B50]" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca tu pregunta: bono, giros, sede, contraseña…"
              className="w-full rounded-xl border border-[#D4AF37]/25 bg-[#121009]/80 py-3.5 pr-4 pl-11 text-sm text-[#F5E6C8] placeholder:text-[#6B5D3F] focus:border-[#D4AF37]/60 focus:outline-none"
            />
          </div>
          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {[{ id: 'todas' as const, label: 'Todas' }, ...FAQ_CATEGORIAS].map((c) => {
              const on = categoria === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoria(c.id)}
                  className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                    on
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F0C847]'
                      : 'border-[#D4AF37]/20 text-[#9A7B50] hover:border-[#D4AF37]/45 hover:text-[#C4A97A]'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          {/* ---------- Acordeón ---------- */}
          <div className="flex flex-col gap-3">
            {resultados.map((item) => {
              const open = abierta === item.question
              return (
                <div
                  key={item.question}
                  className={`overflow-hidden rounded-2xl border transition-colors ${open ? 'border-[#D4AF37]/45' : 'border-[#D4AF37]/15'}`}
                  style={{
                    background: open
                      ? 'linear-gradient(145deg, rgba(212,175,55,0.08), #121009)'
                      : 'linear-gradient(145deg, #1C1810, #121009)',
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setAbierta(open ? null : item.question)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span className={`font-semibold ${open ? 'text-[#F0C847]' : 'text-[#F5E6C8]'}`}>{item.question}</span>
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        open ? 'rotate-45 border-[#D4AF37] bg-[#D4AF37]/15 text-[#F0C847]' : 'border-[#D4AF37]/30 text-[#D4AF37]'
                      }`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                  {/* grid-rows 0fr -> 1fr: anima la altura sin medirla. */}
                  <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-[#C4A97A] sm:px-6">{item.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {resultados.length === 0 && (
              <Panel>
                <div className="flex items-center gap-3 text-sm text-[#C4A97A]">
                  <HelpCircle size={20} className="text-[#D4AF37]" />
                  No encontramos preguntas con "{busqueda}". Prueba con otra palabra o elige "Todas".
                </div>
              </Panel>
            )}
          </div>
        </div>

        {/* ---------- Lateral ---------- */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <Panel tono="oro">
            <p className="mb-3 text-[10px] font-extrabold tracking-[0.22em] text-[#D4AF37]">LOS 3 BONOS DE LA TRAGAMONEDAS</p>
            <PremiosResumen variante="mini" />
            <p className="mt-3 text-xs leading-relaxed text-[#9A7B50]">Uno por persona · Se redimen en caja con tu cédula.</p>
            <button
              type="button"
              onClick={() => navigate('roulette')}
              className="mt-4 w-full rounded-lg py-2.5 text-xs font-extrabold tracking-[0.06em] text-[#1a1408]"
              style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37 55%, #A0832A)' }}
            >
              ✦ JUGAR AHORA ✦
            </button>
          </Panel>
          <Panel>
            <p className="mb-2 font-display text-lg font-bold text-[#F5E6C8]">¿Tu pregunta no está aquí?</p>
            <p className="mb-4 text-sm leading-relaxed text-[#C4A97A]">
              Acércate a la caja de cualquiera de nuestras sedes o escríbenos por nuestras redes oficiales.
            </p>
            <button
              type="button"
              onClick={() => navigate('how-it-works')}
              className="w-full rounded-lg border border-[#D4AF37]/35 py-2.5 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Ver cómo funciona
            </button>
          </Panel>
        </aside>
      </div>

      <div className="mt-16">
        <AyudaJuegoPanel />
      </div>
    </InfoPageShell>
  )
}
