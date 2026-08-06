import { useEffect, useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import {
  cajeroBuscarCodigo,
  cajeroBuscarPorDocumento,
  cajeroConfirmarCanje,
  cajeroFetchHistorial,
  ApiError,
} from '@/shared/api/client'
import type { BusquedaPorDocumento, CanjeHistorialRow, CanjePreview } from '@/shared/api/types'
import StaffSidebarLayout from '@/shared/components/StaffSidebarLayout'
import { Gift, Search, Loader2, CircleCheck, History, Building2, TriangleAlert, IdCard, CircleX } from 'lucide-react'

interface Props {
  navigate: (page: Page) => void
}

type CajeroSection = 'canjear' | 'buscar' | 'historial'

const NAV_ITEMS = [
  { id: 'canjear' as CajeroSection, label: 'Canjear Código', icon: Gift },
  { id: 'buscar' as CajeroSection, label: 'Buscar por Cédula', icon: IdCard },
  { id: 'historial' as CajeroSection, label: 'Mis Canjes', icon: History },
]

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
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
  // El backend decide el alcance según el rol: una cajera solo recibe sus
  // propios canjes, un admin los recibe todos.
  const [soloPropios, setSoloPropios] = useState(true)


  // --- Búsqueda por documento (cliente que llegó sin código) ---
  const [doc, setDoc] = useState('')
  const [encontrado, setEncontrado] = useState<BusquedaPorDocumento | null>(null)
  const [docError, setDocError] = useState<string | null>(null)
  const [buscandoDoc, setBuscandoDoc] = useState(false)

  const buscarPorDocumento = async () => {
    if (!token || !doc.trim()) return
    setDocError(null)
    setEncontrado(null)
    setSuccess(null)
    setBuscandoDoc(true)
    try {
      setEncontrado(await cajeroBuscarPorDocumento(token, doc.trim()))
    } catch (err) {
      setDocError(err instanceof ApiError ? err.message : 'No se pudo buscar el documento.')
    } finally {
      setBuscandoDoc(false)
    }
  }

  // Canje directo desde la búsqueda por documento: el cajero ya verificó al
  // titular contra su cédula, no tiene sentido pedirle que copie el código.
  const confirmarDesdeDocumento = async () => {
    if (!token || !encontrado?.bono) return
    setDocError(null)
    setCanjeando(true)
    try {
      const result = await cajeroConfirmarCanje(token, encontrado.bono.codigo)
      setSuccess(
        `Bono "${result.premio.nombre}" canjeado para ${result.cliente.nombres} ${result.cliente.apellidos}` +
          `${result.sedeRedencion ? ` en ${result.sedeRedencion.nombre}` : ''}.`,
      )
      setHistorial(null)
      // Se refresca la ficha para que quede mostrando el estado real ya canjeado.
      setEncontrado(await cajeroBuscarPorDocumento(token, encontrado.cliente.docNumero))
    } catch (err) {
      setDocError(err instanceof ApiError ? err.message : 'No se pudo confirmar el canje.')
    } finally {
      setCanjeando(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!staff || (staff.rol !== 'cajero' && staff.rol !== 'admin')) {
      navigate('landing')
    }
  }, [authLoading, staff, navigate])

  useEffect(() => {
    if (section !== 'historial' || !token || historial) return
    cajeroFetchHistorial(token)
      .then((res) => {
        setHistorial(res.canjes)
        setSoloPropios(res.soloPropios)
      })
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
      setSuccess(
        `Bono "${result.premio.nombre}" canjeado para ${result.cliente.nombres} ${result.cliente.apellidos}` +
          `${result.sedeRedencion ? ` en ${result.sedeRedencion.nombre}` : ''}.`,
      )
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

                {/* Datos para cotejar contra el documento fisico antes de
                    entregar: el documento es el que manda. */}
                <p className="text-xs text-[#6B5D3F] mb-2">Verifica la identidad del cliente</p>
                <p className="text-base text-[#F5E6C8] font-semibold">{preview.cliente.nombres} {preview.cliente.apellidos}</p>
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
                    <span className="text-[#C4A97A]">{preview.cliente.ciudad}, {preview.cliente.departamento}</span>
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

                {/* Casino asignado y vigencia: es lo que el cajero necesita
                    confirmar antes de entregar. */}
                <div className="mt-5 grid gap-2">
                  {preview.sedeRedencion && (
                    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/6 px-4 py-3">
                      <p className="text-[10px] text-[#D4AF37] font-bold tracking-wider mb-1 flex items-center gap-1.5">
                        <Building2 size={12} /> CASINO ASIGNADO
                      </p>
                      <p className="text-sm text-[#F5E6C8]">{preview.sedeRedencion.nombre}</p>
                      <p className="text-xs text-[#6B5D3F]">{preview.sedeRedencion.direccion}</p>
                    </div>
                  )}
                  <p className={`text-xs ${preview.vencido ? 'text-red-400' : 'text-[#6B5D3F]'}`}>
                    {preview.vencido ? 'VENCIDO el ' : 'Válido hasta el '}
                    {formatDate(preview.vigenciaHasta)}
                  </p>
                </div>

                {preview.vencido && preview.estado === 'pendiente' ? (
                  <p className="mt-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                    Este bono venció y ya no puede redimirse.
                  </p>
                ) : preview.estado === 'pendiente' ? (
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
                    Este bono ya fue canjeado anteriormente
                    {preview.sedeCanje ? ` en ${preview.sedeCanje}` : ''}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BUSCAR POR CÉDULA — salida para el cliente que llegó sin código */}
      {section === 'buscar' && (
        <div className="flex justify-center" style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <IdCard size={40} className="text-[#D4AF37] mx-auto mb-3" />
              <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>Buscar por cédula</h2>
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
                onKeyDown={(e) => e.key === 'Enter' && buscarPorDocumento()}
                className="flex-1 px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 font-mono tracking-wider"
              />
              <button
                onClick={buscarPorDocumento}
                disabled={buscandoDoc || !doc.trim()}
                className="px-5 rounded-xl font-bold text-[#0a0805] transition-all disabled:opacity-50 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
              >
                {buscandoDoc ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>

            {docError && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-6">
                {docError}
              </p>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-4 mb-6 text-center flex flex-col items-center gap-2">
                <CircleCheck size={28} className="text-green-400" />
                <p className="text-sm text-green-300">{success}</p>
              </div>
            )}

            {encontrado && (
              <div className="rounded-2xl border border-[#D4AF37]/20 p-6" style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
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
                    <span className="text-[#C4A97A]">{encontrado.cliente.ciudad}, {encontrado.cliente.departamento}</span>
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
                    <p className="text-xs text-[#6B5D3F] mt-1">Se registró sin pasar por la ruleta o su premio nunca se reclamó.</p>
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
                      Código: <span className="text-[#D4AF37] font-mono tracking-wider">{encontrado.bono.codigo}</span>
                    </p>

                    {encontrado.bono.sedeRedencion && (
                      <div className="mt-4 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/6 px-4 py-3">
                        <p className="text-[10px] text-[#D4AF37] font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <Building2 size={12} /> CASINO ASIGNADO
                        </p>
                        <p className="text-sm text-[#F5E6C8]">{encontrado.bono.sedeRedencion.nombre}</p>
                        <p className="text-xs text-[#6B5D3F]">{encontrado.bono.sedeRedencion.direccion}</p>
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
                    ) : (
                    <button
                      onClick={confirmarDesdeDocumento}
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
                    {/* Auditoría: permite responderle al cliente exactamente
                        cuándo y dónde se le entregó, en vez de un "no aparece". */}
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
      )}

      {/* HISTORIAL */}
      {section === 'historial' && (
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
                    <th className="px-4 py-3 font-medium">Sede</th>
                    {!soloPropios && <th className="px-4 py-3 font-medium">Canjeado por</th>}
                    <th className="px-4 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.codigo} className="border-b border-[#D4AF37]/8 last:border-0">
                      <td className="px-4 py-3 text-[#D4AF37] font-mono whitespace-nowrap">{h.codigo}</td>
                      <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{h.premio.nombre}</td>
                      <td className="px-4 py-3 text-[#F5E6C8] whitespace-nowrap">{h.cliente.nombres} {h.cliente.apellidos}<br /><span className="text-xs text-[#6B5D3F]">{h.cliente.docNumero}</span></td>
                      <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{h.sede || '—'}</td>
                      {!soloPropios && (
                        <td className="px-4 py-3 text-[#9A7B50] whitespace-nowrap">{h.canjeadoPor || '—'}</td>
                      )}
                      <td className="px-4 py-3 text-[#6B5D3F] whitespace-nowrap">{h.canjeadoEn ? formatDateTime(h.canjeadoEn) : '—'}</td>
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
      )}
    </StaffSidebarLayout>
  )
}
