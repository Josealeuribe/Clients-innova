import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, TriangleAlert } from 'lucide-react'

interface Props {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder: string
  error?: string
}

// Selector propio (no el <select> nativo, que cada navegador pinta a su modo y
// en Windows sale blanco). Con más de 8 opciones trae buscador: departamentos y
// municipios son listas largas.
export default function FormSelect({ label, options, value, onChange, disabled = false, placeholder, error }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [activo, setActivo] = useState(0)
  const caja = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const conBuscador = options.length > 8

  const visibles = useMemo(() => {
    const q = normalizar(filtro)
    return q ? options.filter((o) => normalizar(o).includes(q)) : options
  }, [options, filtro])

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [abierto])

  useEffect(() => {
    lista.current?.querySelector<HTMLElement>(`[data-i="${activo}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [activo])

  const abrir = () => {
    if (disabled) return
    setFiltro('')
    setActivo(Math.max(0, options.indexOf(value)))
    setAbierto(true)
  }

  const elegir = (opcion: string) => {
    onChange(opcion)
    setAbierto(false)
  }

  const teclado = (e: React.KeyboardEvent) => {
    if (!abierto) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        abrir()
      }
      return
    }
    if (e.key === 'Escape') setAbierto(false)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActivo((i) => Math.min(visibles.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (visibles[activo]) elegir(visibles[activo])
    }
  }

  return (
    <div className="flex flex-col gap-1" ref={caja} onKeyDown={teclado}>
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">{label}</label>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => (abierto ? setAbierto(false) : abrir())}
          aria-haspopup="listbox"
          aria-expanded={abierto}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-[#121009] px-4 py-3 text-left text-sm transition-all outline-none
            focus-visible:border-[#D4AF37]/60 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/20
            disabled:cursor-not-allowed disabled:opacity-40
            ${error ? 'border-red-500/60' : abierto ? 'border-[#D4AF37]/60 ring-1 ring-[#D4AF37]/20' : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/35'}`}
        >
          <span className={`truncate ${value ? 'text-[#F5E6C8]' : 'text-[#4A3D28]'}`}>{value || placeholder}</span>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 text-[#D4AF37] transition-transform ${abierto ? 'rotate-180' : ''}`}
          />
        </button>

        {abierto && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-[#16130C] shadow-[0_18px_40px_rgba(0,0,0,0.6)]">
            {conBuscador && (
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/15 px-3 py-2">
                <Search size={14} className="text-[#9A7B50]" />
                <input
                  autoFocus
                  value={filtro}
                  onChange={(e) => {
                    setFiltro(e.target.value)
                    setActivo(0)
                  }}
                  placeholder="Buscar..."
                  className="w-full bg-transparent text-sm text-[#F5E6C8] outline-none placeholder:text-[#4A3D28]"
                />
              </div>
            )}
            <ul ref={lista} role="listbox" className="max-h-60 overflow-y-auto py-1">
              {visibles.length === 0 && <li className="px-4 py-3 text-xs text-[#6B5D3F]">Sin resultados</li>}
              {visibles.map((opcion, i) => {
                const elegido = opcion === value
                return (
                  <li
                    key={opcion}
                    data-i={i}
                    role="option"
                    aria-selected={elegido}
                    onMouseEnter={() => setActivo(i)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      elegir(opcion)
                    }}
                    className={`flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors
                      ${i === activo ? 'bg-[#D4AF37]/12 text-[#F0C847]' : 'text-[#E8DAB8]'}
                      ${elegido ? 'font-semibold' : ''}`}
                  >
                    <span className="truncate">{opcion}</span>
                    {elegido && <Check size={14} className="flex-shrink-0 text-[#D4AF37]" />}
                  </li>
                )
              })}
            </ul>
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

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
