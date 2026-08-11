import { Gift, Loader2, Search } from 'lucide-react'
import type { CanjePreview } from '@/shared/api/types'
import CajeroError from '../components/CajeroError'
import CajeroSuccess from '../components/CajeroSuccess'
import SedeBonoCard from '../components/SedeBonoCard'
import { esDeOtroCasino } from '../utils/cajeroValidators'
import { formatDate } from '../utils/cajeroFormatters'


interface Props {
  codigo: string
  setCodigo: (value: string) => void
  preview: CanjePreview | null
  error: string | null
  success: string | null
  searching: boolean
  canjeando: boolean
  sedeActual?: { clave: string } | null
  onBuscar: () => void | Promise<void>
  onConfirmar: () => void | Promise<void>
}

export default function CanjearCodigoSection({
  codigo,
  setCodigo,
  preview,
  error,
  success,
  searching,
  canjeando,
  sedeActual,
  onBuscar,
  onConfirmar,
}: Props) {
  const otroCasino = preview?.sedeRedencion
    ? esDeOtroCasino(sedeActual, preview.sedeRedencion)
    : false

  return (
    <div className="flex justify-center" style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Gift size={40} className="text-[#D4AF37] mx-auto mb-3" />
          <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Canjear código de bono
          </h2>
          <p className="text-sm text-[#9A7B50] mt-1">
            Ingresa el código que te presenta el cliente para verificarlo antes de canjearlo.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="GCC-2026-XXXX"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && void onBuscar()}
            className="flex-1 px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 font-mono tracking-wider"
          />
          <button
            onClick={() => void onBuscar()}
            disabled={searching || !codigo.trim()}
            className="px-5 rounded-xl font-bold text-[#0a0805] transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>

        {error && <CajeroError message={error} centered />}
        {success && <CajeroSuccess message={success} />}

        {preview && (
          <div
            className="rounded-2xl border border-[#D4AF37]/20 p-6"
            style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
          >
            <p className="text-xs text-[#6B5D3F] mb-1">Premio</p>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-1">{preview.premio.nombre}</h3>
            <p className="text-sm text-[#9A7B50] mb-4">{preview.premio.detalle}</p>

            <div className="h-px bg-[#D4AF37]/15 my-4" />

            <p className="text-xs text-[#6B5D3F] mb-2">Verifica la identidad del cliente</p>
            <p className="text-base text-[#F5E6C8] font-semibold">
              {preview.cliente.nombres} {preview.cliente.apellidos}
            </p>
            <p className="text-sm text-[#D4AF37] font-mono mt-0.5">
              {preview.cliente.docTipo}: {preview.cliente.docNumero}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
              <div>
                <span className="block text-[#6B5D3F]">Celular</span>
                <span className="text-[#C4A97A]">{preview.cliente.telefono}</span>
              </div>
              <div>
                <span className="block text-[#6B5D3F]">Ciudad</span>
                <span className="text-[#C4A97A]">
                  {preview.cliente.ciudad}, {preview.cliente.departamento}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[#6B5D3F]">Correo</span>
                <span className="text-[#C4A97A] break-all">{preview.cliente.email}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[#6B5D3F]">Registrado el</span>
                <span className="text-[#C4A97A]">{formatDate(preview.cliente.registradoEn)}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              {preview.sedeRedencion && (
                <SedeBonoCard
                  sede={preview.sedeRedencion}
                  otroCasino={otroCasino}
                  mostrarAdvertencia
                />
              )}
              <p className={`text-xs ${preview.vencido ? 'text-red-400' : 'text-[#6B5D3F]'}`}>
                {preview.vencido ? 'VENCIDO el ' : 'Válido hasta el '}
                {formatDate(preview.vigenciaHasta)}
              </p>
            </div>

            {preview.estado === 'pendiente' && preview.vencido ? (
              <p className="mt-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                Este bono venció y ya no puede redimirse.
              </p>
            ) : preview.estado === 'pendiente' && otroCasino ? (
              <p className="mt-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                No puedes redimir un bono de otro casino.
              </p>
            ) : preview.estado === 'pendiente' ? (
              <button
                onClick={() => void onConfirmar()}
                disabled={canjeando}
                className="w-full mt-6 py-3.5 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
              >
                {canjeando ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Canje'}
              </button>
            ) : (
              <p className="mt-6 text-center text-sm text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/25 rounded-xl px-4 py-3">
                Este bono ya fue canjeado anteriormente
                {preview.sedeCanje ? ` en ${preview.sedeCanje}` : ''}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
