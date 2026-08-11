import { CircleX, IdCard, Loader2, Search } from 'lucide-react'
import type { BusquedaPorDocumento } from '@/shared/api/types'
import CajeroError from '../components/CajeroError'
import CajeroSuccess from '../components/CajeroSuccess'
import SedeBonoCard from '../components/SedeBonoCard'
import { esDeOtroCasino } from '../utils/cajeroValidators'
import { formatDate, formatDateTime } from '../utils/cajeroFormatters'

interface Props {
  doc: string
  setDoc: (value: string) => void
  encontrado: BusquedaPorDocumento | null
  error: string | null
  success: string | null
  buscando: boolean
  canjeando: boolean
  sedeActual?: { clave: string } | null
  onBuscar: () => void | Promise<void>
  onConfirmar: () => void | Promise<void>
}

export default function BuscarDocumentoSection({
  doc,
  setDoc,
  encontrado,
  error,
  success,
  buscando,
  canjeando,
  sedeActual,
  onBuscar,
  onConfirmar,
}: Props) {
  const otroCasino = encontrado?.bono?.sedeRedencion
    ? esDeOtroCasino(sedeActual, encontrado.bono.sedeRedencion)
    : false

  return (
    <div className="flex justify-center" style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <IdCard size={40} className="text-[#D4AF37] mx-auto mb-3" />
          <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Buscar por cédula
          </h2>
          <p className="text-sm text-[#9A7B50] mt-1">
            Para cuando el cliente no recuerda su código o llegó sin celular. Verifica siempre contra el documento físico.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Número de documento"
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void onBuscar()}
            className="flex-1 px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 font-mono tracking-wider"
          />
          <button
            onClick={() => void onBuscar()}
            disabled={buscando || !doc.trim()}
            className="px-5 rounded-xl font-bold text-[#0a0805] transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
          >
            {buscando ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>

        {error && <CajeroError message={error} centered />}
        {success && <CajeroSuccess message={success} />}

        {encontrado && (
          <div
            className="rounded-2xl border border-[#D4AF37]/20 p-6"
            style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
          >
            <p className="text-xs text-[#6B5D3F] mb-2">Verifica la identidad del cliente</p>
            <p className="text-base text-[#F5E6C8] font-semibold">
              {encontrado.cliente.nombres} {encontrado.cliente.apellidos}
            </p>
            <p className="text-sm text-[#D4AF37] font-mono mt-0.5">
              {encontrado.cliente.docTipo}: {encontrado.cliente.docNumero}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
              <div>
                <span className="block text-[#6B5D3F]">Celular</span>
                <span className="text-[#C4A97A]">{encontrado.cliente.telefono}</span>
              </div>
              <div>
                <span className="block text-[#6B5D3F]">Ciudad</span>
                <span className="text-[#C4A97A]">
                  {encontrado.cliente.ciudad}, {encontrado.cliente.departamento}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[#6B5D3F]">Registrado el</span>
                <span className="text-[#C4A97A]">{formatDate(encontrado.cliente.registradoEn)}</span>
              </div>
            </div>

            <div className="h-px bg-[#D4AF37]/15 my-5" />

            {!encontrado.bono && (
              <div className="text-center py-2">
                <CircleX size={28} className="text-[#6B5D3F] mx-auto mb-2" />
                <p className="text-sm text-[#9A7B50]">Este cliente no tiene ningún bono asociado.</p>
                <p className="text-xs text-[#6B5D3F] mt-1">
                  Se registró sin pasar por la ruleta o su premio nunca se reclamó.
                </p>
              </div>
            )}

            {encontrado.bono?.estado === 'pendiente' && (
              <>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30">
                  Bono activo
                </span>
                <h3 className="text-lg font-bold text-[#D4AF37] mt-3 mb-1">{encontrado.bono.premio.nombre}</h3>
                <p className="text-sm text-[#9A7B50] mb-3">{encontrado.bono.premio.detalle}</p>
                <p className="text-xs text-[#6B5D3F]">
                  Código:{' '}
                  <span className="text-[#D4AF37] font-mono tracking-wider">{encontrado.bono.codigo}</span>
                </p>

                {encontrado.bono.sedeRedencion && (
                  <div className="mt-4">
                    <SedeBonoCard sede={encontrado.bono.sedeRedencion} />
                  </div>
                )}

                <p className={`mt-2 text-xs ${encontrado.bono.vencido ? 'text-red-400' : 'text-[#6B5D3F]'}`}>
                  {encontrado.bono.vencido ? 'VENCIDO el ' : 'Válido hasta el '}
                  {formatDate(encontrado.bono.vigenciaHasta)}
                </p>

                {encontrado.bono.vencido ? (
                  <p className="mt-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                    Este bono venció y ya no puede redimirse.
                  </p>
                ) : otroCasino ? (
                  <p className="mt-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                    Este bono solo puede redimirse en {encontrado.bono.sedeRedencion?.nombre}. Indícale al cliente que se dirija allí.
                  </p>
                ) : (
                  <button
                    onClick={() => void onConfirmar()}
                    disabled={canjeando}
                    className="w-full mt-6 py-3.5 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
                  >
                    {canjeando ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Canje'}
                  </button>
                )}
              </>
            )}

            {encontrado.bono?.estado === 'reclamado' && (
              <>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-[#9A7B50] bg-[#9A7B50]/10 border border-[#9A7B50]/30">
                  Ya redimido
                </span>
                <h3 className="text-lg font-bold text-[#C4A97A] mt-3 mb-3">{encontrado.bono.premio.nombre}</h3>
                <div className="rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 p-4 grid gap-1.5 text-xs">
                  <span className="text-[#9A7B50]">
                    Código: <span className="text-[#C4A97A] font-mono">{encontrado.bono.codigo}</span>
                  </span>
                  {encontrado.bono.canjeadoEn && (
                    <span className="text-[#9A7B50]">Entregado: {formatDateTime(encontrado.bono.canjeadoEn)}</span>
                  )}
                  {encontrado.bono.sede && <span className="text-[#9A7B50]">Sede: {encontrado.bono.sede}</span>}
                  {encontrado.bono.canjeadoPor && (
                    <span className="text-[#9A7B50]">Atendido por: {encontrado.bono.canjeadoPor}</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
