import { useState } from 'react'
import { KeyRound, CircleCheck, TriangleAlert } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import { ApiError, cambiarPassword } from '@/shared/api/client'

// Cambio de contraseña con la sesión abierta.
//
// Para el personal (admin y cajeras) esta es la ÚNICA forma de cambiar su
// propia contraseña: sus direcciones @grancasino.com.co son identificadores de
// acceso, no buzones — el dominio no tiene registros MX y no puede recibir un
// código. Los clientes sí tienen además la recuperación por correo desde el
// login, porque el suyo es un correo real que ellos mismos registraron.
//
// Se pide la contraseña actual aunque ya haya sesión: una pantalla desatendida
// en el mostrador de caja no debe alcanzar para adueñarse de la cuenta.

export function CambiarPasswordForm() {
  const { token, marcarPasswordCambiada } = useAuth()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [ver, setVer] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  const guardar = async () => {
    if (!token) return
    setError(null)
    setGuardando(true)
    try {
      await cambiarPassword(token, actual, nueva, confirmar)
      marcarPasswordCambiada()
      setActual('')
      setNueva('')
      setConfirmar('')
      setListo(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cambiar la contraseña.')
    } finally {
      setGuardando(false)
    }
  }

  const campo = (
    etiqueta: string,
    valor: string,
    set: (v: string) => void,
    autoComplete: string,
    placeholder: string,
    alEnviar = false,
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#C4A97A] tracking-wide">{etiqueta}</label>
      <input
        type={ver ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => { set(e.target.value); setListo(false) }}
        onKeyDown={(e) => {
          if (alEnviar && e.key === 'Enter' && actual && nueva && confirmar) void guardar()
        }}
        className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 transition-all outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
      />
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {campo('Contraseña actual', actual, setActual, 'current-password', 'Tu contraseña de hoy')}
      {campo('Nueva contraseña', nueva, setNueva, 'new-password', 'Mínimo 8 caracteres')}
      {campo('Confirmar nueva contraseña', confirmar, setConfirmar, 'new-password', 'Repite la nueva', true)}

      <label className="flex items-center gap-2 cursor-pointer -mt-1">
        <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} className="accent-[#D4AF37]" />
        <span className="text-xs text-[#6B5D3F]">Ver contraseñas</span>
      </label>

      <p className="text-[11px] text-[#6B5D3F] leading-relaxed">
        Debe tener al menos 8 caracteres, una mayúscula y un número.
      </p>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{error}</p>
      )}

      {listo && !error && (
        <p className="text-[#22c55e] text-sm bg-[#22c55e]/10 border border-[#22c55e]/25 rounded-xl px-4 py-3 inline-flex items-center gap-2">
          <CircleCheck size={16} className="flex-shrink-0" /> Contraseña actualizada. Úsala en tu próximo ingreso.
        </p>
      )}

      <button
        type="button"
        onClick={() => void guardar()}
        disabled={guardando || !actual || !nueva || !confirmar}
        className="w-full py-3.5 rounded-xl font-bold text-[#0a0805] transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
          letterSpacing: '0.06em',
        }}
      >
        {guardando ? '⏳ Guardando...' : 'Cambiar contraseña'}
      </button>
    </div>
  )
}

// Sección "Mi cuenta" de los paneles de admin y cajero.
export function MiCuentaSection() {
  const { staff } = useAuth()

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }} className="max-w-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>Mi cuenta</h2>
        <p className="text-sm text-[#9A7B50] mt-1">{staff?.nombre}</p>
      </div>

      <div className="rounded-2xl border border-[#D4AF37]/12 p-5 mb-6" style={{ background: '#121009' }}>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#6B5D3F]">Usuario</span>
            <span className="text-[#C4A97A] truncate">{staff?.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#6B5D3F]">Rol</span>
            <span className="text-[#C4A97A] capitalize">{staff?.rol}</span>
          </div>
          {staff?.sede && (
            <div className="flex justify-between gap-4">
              <span className="text-[#6B5D3F]">Sede</span>
              <span className="text-[#C4A97A] text-right">{staff.sede.nombre}</span>
            </div>
          )}
        </div>
        {/* Se dice explícitamente para que nadie espere un correo que no va a
            llegar: estas direcciones no son buzones. */}
        <p className="text-[11px] text-[#6B5D3F] mt-4 pt-4 border-t border-[#D4AF37]/10 leading-relaxed">
          Tu correo es solo tu usuario de acceso: no recibe mensajes. Si olvidas la contraseña, pídele al
          administrador que te genere una temporal.
        </p>
      </div>

      <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
        <h3 className="font-bold text-[#F5E6C8] mb-4 inline-flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          <KeyRound size={18} className="text-[#D4AF37]" /> Cambiar contraseña
        </h3>
        <CambiarPasswordForm />
      </div>
    </div>
  )
}

// Modal que tapa el panel hasta que se cambie la contraseña. Aparece cuando se
// entró con una clave temporal o con la inicial derivada de la cédula.
//
// No tiene botón de cerrar a propósito: si se pudiera saltar, la clave
// temporal se quedaría puesta, que es justo lo que esto viene a impedir. La
// salida es cambiarla o cerrar sesión.
//
// Al guardar no muestra confirmación: el propio modal desaparece porque quien
// lo monta mira `staff.debeCambiarPassword`, y el panel queda a la vista. Esa
// es la confirmación.
export function CambioPasswordObligatorio() {
  const { logout } = useAuth()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div
        className="relative max-w-md w-full my-8 rounded-3xl border border-[#D4AF37]/40 p-7"
        style={{
          background: 'linear-gradient(145deg, #1C1810 0%, #121009 100%)',
          animation: 'modal-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          boxShadow: '0 0 60px rgba(212,175,55,0.18), 0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="text-center mb-5">
          <TriangleAlert size={44} className="text-[#eab308] mx-auto mb-3" />
          <h2 className="text-xl font-black text-[#F5E6C8] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Cambia tu contraseña
          </h2>
          <p className="text-sm text-[#9A7B50] leading-relaxed">
            Estás entrando con una contraseña temporal. Elige una propia antes de continuar: con esta cuenta se
            marcan bonos como entregados.
          </p>
        </div>

        <CambiarPasswordForm />

        <button
          type="button"
          onClick={logout}
          className="w-full mt-3 py-2.5 rounded-xl text-sm text-[#6B5D3F] hover:text-[#C4A97A] transition-all"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
