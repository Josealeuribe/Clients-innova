import { useState } from 'react'
import { CircleCheck, Copy, KeyRound, Loader2, TriangleAlert } from 'lucide-react'
import type { AdminUsuarioRow } from '@/shared/api/types'
import type { TemporalPassword } from '../admin.types'
import AdminError from '../components/AdminError'
import AdminLoading from '../components/AdminLoading'
import StatusBadge from '../components/StatusBadge'

interface Props {
  usuarios: AdminUsuarioRow[] | null
  error: string | null
  temporal: TemporalPassword | null
  reseteando: number | null
  onRestablecer: (usuario: AdminUsuarioRow) => Promise<void>
  onClearTemporal: () => void
}

export default function PersonalSection({
  usuarios,
  error,
  temporal,
  reseteando,
  onRestablecer,
  onClearTemporal,
}: Props) {
  const [copiado, setCopiado] = useState(false)

  const clearTemporal = () => {
    onClearTemporal()
    setCopiado(false)
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Personal
        </h2>
        <p className="text-sm text-[#9A7B50] mt-1">Cuentas de administración y caja</p>
      </div>

      <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/6 p-4 mb-6 flex gap-3">
        <KeyRound size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#C4A97A] leading-relaxed">
          Los correos del personal son solo usuarios de acceso: el dominio no recibe mensajes, así que no hay
          recuperación por correo. Si alguien olvida su contraseña, genérale una temporal aquí y entrégasela en
          persona. El sistema la obliga a cambiarla al entrar.
        </p>
      </div>

      {temporal && (
        <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/8 p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <CircleCheck size={18} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-[#F5E6C8] font-semibold">Contraseña temporal de {temporal.nombre}</p>
              <p className="text-xs text-[#9A7B50] mt-0.5 truncate">{temporal.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <code className="px-4 py-2.5 rounded-xl bg-[#0a0805] border border-[#D4AF37]/25 text-[#D4AF37] text-lg font-bold tracking-widest">
              {temporal.clave}
            </code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(temporal.clave)
                  .then(() => setCopiado(true))
                  .catch(() => {})
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#9A7B50] border border-[#D4AF37]/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/45 transition-all"
            >
              <Copy size={14} /> {copiado ? 'Copiada' : 'Copiar'}
            </button>
          </div>

          <p className="text-xs text-[#9A7B50] leading-relaxed mb-3 inline-flex items-start gap-2">
            <TriangleAlert size={14} className="text-[#eab308] flex-shrink-0 mt-0.5" />
            Anótala o entrégala ahora: no se puede volver a consultar. Si se pierde, genera otra.
          </p>

          <button
            type="button"
            onClick={clearTemporal}
            className="text-xs text-[#6B5D3F] hover:text-[#C4A97A] transition-colors underline"
          >
            Ya la entregué, ocultar
          </button>
        </div>
      )}

      {error && <AdminError message={error} />}
      {!usuarios && !error && <AdminLoading label="Cargando personal..." />}

      {usuarios && (
        <div className="rounded-2xl border border-[#D4AF37]/12 overflow-x-auto" style={{ background: '#121009' }}>
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Sede</th>
                <th className="px-4 py-3 font-medium">Bonos entregados</th>
                <th className="px-4 py-3 font-medium">Contraseña</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-[#D4AF37]/8 last:border-0">
                  <td className="px-4 py-3 text-[#F5E6C8] font-medium">{usuario.nombre}</td>
                  <td className="px-4 py-3 text-[#C4A97A]">{usuario.email}</td>
                  <td className="px-4 py-3 text-[#9A7B50] capitalize whitespace-nowrap">{usuario.rol}</td>
                  <td className="px-4 py-3 text-[#9A7B50] whitespace-nowrap">{usuario.sede || '—'}</td>
                  <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{usuario.canjes}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {usuario.debeCambiarPassword ? (
                      <StatusBadge label="Pendiente de cambio" color="#eab308" />
                    ) : (
                      <StatusBadge label="Propia" color="#22c55e" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => void onRestablecer(usuario)}
                      disabled={reseteando === usuario.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#9A7B50] border border-[#D4AF37]/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/45 transition-all disabled:opacity-60"
                    >
                      {reseteando === usuario.id ? (
                        <><Loader2 size={13} className="animate-spin" /> Generando...</>
                      ) : (
                        <><KeyRound size={13} /> Restablecer clave</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#6B5D3F] text-sm">
                    No hay cuentas de personal. Créalas con <code>npm run prisma:seed-staff</code>.
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
