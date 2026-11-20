import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react'

interface Props {
  label: string
  value: string // 'YYYY-MM-DD' o ''
  onChange: (value: string) => void
  error?: string
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const ANIO_MIN = new Date().getFullYear() - 100

const iso = (a: number, m: number, d: number) => `${a}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

function partes(valor: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  return m ? { a: +m[1], m: +m[2] - 1, d: +m[3] } : null
}

// Calendario propio con la paleta del sitio (el del navegador no se puede
// estilizar). Pensado para fecha de nacimiento: se abre unos 25 años atrás y
// tocando el título se salta a elegir año y mes, sin pasar mes por mes.
export default function DateField({ label, value, onChange, error }: Props) {
  const hoy = new Date()
  const elegida = partes(value)
  const [abierto, setAbierto] = useState(false)
  const [vista, setVista] = useState<'dias' | 'meses' | 'anios'>('dias')
  const [anio, setAnio] = useState(elegida?.a ?? hoy.getFullYear() - 25)
  const [mes, setMes] = useState(elegida?.m ?? 0)
  const caja = useRef<HTMLDivElement>(null)
  const anios = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', cerrar)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', cerrar)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  useEffect(() => {
    if (vista === 'anios') anios.current?.querySelector('[data-actual]')?.scrollIntoView({ block: 'center' })
  }, [vista])

  const abrir = () => {
    if (elegida) {
      setAnio(elegida.a)
      setMes(elegida.m)
    }
    setVista('dias')
    setAbierto((v) => !v)
  }

  const moverMes = (delta: number) => {
    const f = new Date(anio, mes + delta, 1)
    setAnio(f.getFullYear())
    setMes(f.getMonth())
  }

  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7 // lunes = 0
  const diasMes = new Date(anio, mes + 1, 0).getDate()
  const futuro = (d: number) => new Date(anio, mes, d) > hoy

  const texto = elegida ? `${elegida.d} de ${MESES[elegida.m].toLowerCase()} de ${elegida.a}` : 'Selecciona tu fecha'

  return (
    <div className="flex flex-col gap-1" ref={caja}>
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">{label}</label>

      <div className="relative">
        <button
          type="button"
          onClick={abrir}
          aria-haspopup="dialog"
          aria-expanded={abierto}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-[#121009] px-4 py-3 text-left text-sm transition-all outline-none
            focus-visible:border-[#D4AF37]/60 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/20
            ${error ? 'border-red-500/60' : abierto ? 'border-[#D4AF37]/60 ring-1 ring-[#D4AF37]/20' : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/35'}`}
        >
          <span className={elegida ? 'text-[#F5E6C8]' : 'text-[#4A3D28]'}>{texto}</span>
          <CalendarDays size={16} className="flex-shrink-0 text-[#D4AF37]" />
        </button>

        {abierto && (
          <div
            role="dialog"
            className="absolute left-0 top-full z-40 mt-1.5 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#D4AF37]/30 bg-[#16130C] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => (vista === 'dias' ? moverMes(-1) : setAnio((a) => a - 1))}
                disabled={vista === 'anios'}
                className="rounded-lg p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:invisible"
                aria-label="Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setVista(vista === 'dias' ? 'anios' : vista === 'meses' ? 'anios' : 'dias')}
                className="rounded-lg px-3 py-1 text-sm font-bold text-[#F5E6C8] hover:bg-[#D4AF37]/10"
              >
                {vista === 'dias' ? `${MESES[mes]} ${anio}` : vista === 'meses' ? anio : 'Elige el año'}
              </button>
              <button
                type="button"
                onClick={() => (vista === 'dias' ? moverMes(1) : setAnio((a) => a + 1))}
                disabled={vista === 'anios' || (vista === 'dias' ? new Date(anio, mes + 1, 1) > hoy : anio >= hoy.getFullYear())}
                className="rounded-lg p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:opacity-30"
                aria-label="Siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {vista === 'dias' && (
              <>
                <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-bold tracking-wider text-[#9A7B50]">
                  {DIAS.map((d) => (
                    <span key={d} className="py-1">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: primerDia }, (_, i) => (
                    <span key={`v${i}`} />
                  ))}
                  {Array.from({ length: diasMes }, (_, i) => {
                    const d = i + 1
                    const sel = elegida?.a === anio && elegida.m === mes && elegida.d === d
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={futuro(d)}
                        onClick={() => {
                          onChange(iso(anio, mes, d))
                          setAbierto(false)
                        }}
                        className={`h-9 rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-25
                          ${sel ? 'bg-gradient-to-br from-[#F0C847] to-[#B8922E] font-bold text-[#1a1408]' : 'text-[#E8DAB8] hover:bg-[#D4AF37]/15'}`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {vista === 'meses' && (
              <div className="grid grid-cols-3 gap-1.5">
                {MESES.map((nombre, i) => (
                  <button
                    key={nombre}
                    type="button"
                    disabled={new Date(anio, i, 1) > hoy}
                    onClick={() => {
                      setMes(i)
                      setVista('dias')
                    }}
                    className={`rounded-lg py-2.5 text-xs transition-colors disabled:opacity-25
                      ${i === mes ? 'bg-[#D4AF37]/20 font-bold text-[#F0C847]' : 'text-[#E8DAB8] hover:bg-[#D4AF37]/12'}`}
                  >
                    {nombre.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {vista === 'anios' && (
              <div ref={anios} className="grid max-h-60 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
                {Array.from({ length: hoy.getFullYear() - ANIO_MIN + 1 }, (_, i) => hoy.getFullYear() - i).map((a) => (
                  <button
                    key={a}
                    type="button"
                    data-actual={a === anio ? '' : undefined}
                    onClick={() => {
                      setAnio(a)
                      setVista('meses')
                    }}
                    className={`rounded-lg py-2 text-xs transition-colors
                      ${a === anio ? 'bg-[#D4AF37]/20 font-bold text-[#F0C847]' : 'text-[#E8DAB8] hover:bg-[#D4AF37]/12'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <TriangleAlert size={12} className="flex-shrink-0" />
          {error}
        </span>
      )}
    </div>
  )
}
