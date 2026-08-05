import { useEffect, useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import { cajeroBuscarCodigo, cajeroConfirmarCanje, cajeroFetchHistorial, ApiError } from '@/shared/api/client'
import type { CanjeHistorialRow, CanjePreview } from '@/shared/api/types'
import StaffSidebarLayout from '@/shared/components/StaffSidebarLayout'
import { Gift, Search, Loader2, CircleCheck, History } from 'lucide-react'

interface Props {
  navigate: (page: Page) => void
}

type CajeroSection = 'canjear' | 'historial'

const NAV_ITEMS = [
  { id: 'canjear' as CajeroSection, label: 'Canjear Código', icon: Gift },
  { id: 'historial' as CajeroSection, label: 'Historial de Canjes', icon: History },
]

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CajeroPage({ navigate }: Props) {
  const { staff, token, loading: authLoading } = useAuth()
  const [section, setSection] = useState<CajeroSection>('canjear')

  const [codigo, setCodigo] = useState('')
  const [preview, setPreview] = useState<CanjePreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [canjeando, setCanjeando] = useState(false)

  const [historial, setHistorial] = useState<CanjeHistorialRow[] | null>(null)
  const [historialError, setHistorialError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!staff || (staff.rol !== 'cajero' && staff.rol !== 'admin')) {
      navigate('landing')
    }
  }, [authLoading, staff, navigate])

  useEffect(() => {
    if (section !== 'historial' || !token || historial) return
    cajeroFetchHistorial(token)
      .then((res) => setHistorial(res.canjes))
      .catch((err) => setHistorialError(err instanceof ApiError ? err.message : 'No se pudo cargar el historial.'))
  }, [section, token, historial])

  const buscar = async () => {
    if (!token || !codigo.trim()) return
    setError(null)
    setSuccess(null)
    setPreview(null)
    setSearching(true)
    try {
      const result = await cajeroBuscarCodigo(token, codigo.trim())
      setPreview(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo buscar el código.')
    } finally {
      setSearching(false)
    }
  }

  const confirmar = async () => {
    if (!token || !preview) return
    setError(null)
    setCanjeando(true)
    try {
      const result = await cajeroConfirmarCanje(token, preview.codigo)
      setSuccess(`Bono "${result.premio.nombre}" canjeado exitosamente para ${result.cliente.nombres} ${result.cliente.apellidos}.`)
      setPreview(null)
      setCodigo('')
      setHistorial(null) // fuerza recarga la próxima vez que se abra el historial
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo confirmar el canje.')
    } finally {
      setCanjeando(false)
    }
  }

  return (
    <StaffSidebarLayout
      title={NAV_ITEMS.find((n) => n.id === section)?.label || 'Panel'}
      navItems={NAV_ITEMS}
      activeSection={section}
      onSectionChange={(id) => setSection(id as CajeroSection)}
    >
      {/* CANJEAR */}
      {section === 'canjear' && (
        <div className="flex justify-center" style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Gift size={40} className="text-[#D4AF37] mx-auto mb-3" />
              <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>Canjear código de bono</h2>
              <p className="text-sm text-[#9A7B50] mt-1">Ingresa el código que te presenta el cliente para verificarlo antes de canjearlo.</p>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="GCC-2026-XXXX"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
                className="flex-1 px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 font-mono tracking-wider"
              />
              <button
                onClick={buscar}
                disabled={searching || !codigo.trim()}
                className="px-5 rounded-xl font-bold text-[#0a0805] transition-all disabled:opacity-50 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
              >
                {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-6">
                {error}
              </p>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-4 mb-6 text-center flex flex-col items-center gap-2">
                <CircleCheck size={28} className="text-green-400" />
                <p className="text-sm text-green-300">{success}</p>
              </div>
            )}

            {preview && (
              <div className="rounded-2xl border border-[#D4AF37]/20 p-6" style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                <p className="text-xs text-[#6B5D3F] mb-1">Premio</p>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-1">{preview.premio.nombre}</h3>
                <p className="text-sm text-[#9A7B50] mb-4">{preview.premio.detalle}</p>

                <div className="h-px bg-[#D4AF37]/15 my-4" />

                <p className="text-xs text-[#6B5D3F] mb-1">Cliente</p>
                <p className="text-sm text-[#F5E6C8] font-medium">{preview.cliente.nombres} {preview.cliente.apellidos}</p>
                <p className="text-xs text-[#9A7B50]">{preview.cliente.docTipo}: {preview.cliente.docNumero}</p>

                {preview.estado === 'pendiente' ? (
                  <button
                    onClick={confirmar}
                    disabled={canjeando}
                    className="w-full mt-6 py-3.5 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
                  >
                    {canjeando ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Canje'}
                  </button>
                ) : (
                  <p className="mt-6 text-center text-sm text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/25 rounded-xl px-4 py-3">
                    Este bono ya fue canjeado anteriormente.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORIAL */}
      {section === 'historial' && (
        <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>Historial de Canjes</h2>
            <p className="text-sm text-[#9A7B50] mt-1">{historial ? `${historial.length} bonos canjeados en total` : 'Cargando...'}</p>
          </div>

          {historialError && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-6">
              {historialError}
            </p>
          )}

          {!historial && !historialError && (
            <div className="flex items-center justify-center gap-2 text-[#9A7B50] py-20">
              <Loader2 size={20} className="animate-spin" /> Cargando historial...
            </div>
          )}

          {historial && (
            <div className="rounded-2xl border border-[#D4AF37]/12 overflow-x-auto" style={{ background: '#121009' }}>
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Premio</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Canjeado por</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.codigo} className="border-b border-[#D4AF37]/8 last:border-0">
                      <td className="px-4 py-3 text-[#D4AF37] font-mono whitespace-nowrap">{h.codigo}</td>
                      <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{h.premio.nombre}</td>
                      <td className="px-4 py-3 text-[#F5E6C8] whitespace-nowrap">{h.cliente.nombres} {h.cliente.apellidos}<br /><span className="text-xs text-[#6B5D3F]">{h.cliente.docNumero}</span></td>
                      <td className="px-4 py-3 text-[#9A7B50] whitespace-nowrap">{h.canjeadoPor || '—'}</td>
                      <td className="px-4 py-3 text-[#6B5D3F] whitespace-nowrap">{h.canjeadoEn ? formatDateTime(h.canjeadoEn) : '—'}</td>
                    </tr>
                  ))}
                  {historial.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[#6B5D3F] text-sm">
                        Aún no se ha canjeado ningún bono.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </StaffSidebarLayout>
  )
}
