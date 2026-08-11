import type { CanjeHistorialRow } from '@/shared/api/types'
import CajeroError from '../components/CajeroError'
import CajeroLoading from '../components/CajeroLoading'
import { formatDateTime } from '../utils/cajeroFormatters'


interface Props {
  historial: CanjeHistorialRow[] | null
  error: string | null
  soloPropios: boolean
}

export default function HistorialSection({ historial, error, soloPropios }: Props) {
  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          {soloPropios ? 'Mis canjes' : 'Todos los canjes'}
        </h2>
        <p className="text-sm text-[#9A7B50] mt-1">
          {historial
            ? soloPropios
              ? `${historial.length} ${historial.length === 1 ? 'bono entregado' : 'bonos entregados'} por ti`
              : `${historial.length} bonos entregados en total`
            : 'Cargando...'}
        </p>
      </div>

      {error && <CajeroError message={error} centered />}
      {!historial && !error && <CajeroLoading label="Cargando historial..." />}

      {historial && (
        <div className="rounded-2xl border border-[#D4AF37]/12 overflow-x-auto" style={{ background: '#121009' }}>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Premio</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Sede</th>
                {!soloPropios && <th className="px-4 py-3 font-medium">Canjeado por</th>}
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item) => (
                <tr key={item.codigo} className="border-b border-[#D4AF37]/8 last:border-0">
                  <td className="px-4 py-3 text-[#D4AF37] font-mono whitespace-nowrap">{item.codigo}</td>
                  <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{item.premio.nombre}</td>
                  <td className="px-4 py-3 text-[#F5E6C8] whitespace-nowrap">
                    {item.cliente.nombres} {item.cliente.apellidos}
                    <br />
                    <span className="text-xs text-[#6B5D3F]">{item.cliente.docNumero}</span>
                  </td>
                  <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{item.sede || '—'}</td>
                  {!soloPropios && (
                    <td className="px-4 py-3 text-[#9A7B50] whitespace-nowrap">{item.canjeadoPor || '—'}</td>
                  )}
                  <td className="px-4 py-3 text-[#6B5D3F] whitespace-nowrap">
                    {item.canjeadoEn ? formatDateTime(item.canjeadoEn) : '—'}
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr>
                  <td colSpan={soloPropios ? 5 : 6} className="px-4 py-10 text-center text-[#6B5D3F] text-sm">
                    {soloPropios ? 'Todavía no has entregado ningún bono.' : 'Aún no se ha canjeado ningún bono.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
