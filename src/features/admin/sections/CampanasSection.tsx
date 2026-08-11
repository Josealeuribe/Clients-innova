import { useMemo, useState } from 'react'
import {
  CalendarClock,
  Copy,
  Megaphone,
  Pencil,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import { AUDIENCIA_LABELS } from '../admin.constants'
import type { Campana, CampanaEstado, CampanaFormData } from '../admin.types'
import StatusBadge from '../components/StatusBadge'
import { useCampanas } from '../hooks/useCampanas'
import { countAudience } from '../utils/adminStats'
import { estimateSmsSegments, formatScheduledDate } from '../utils/adminFormatters'

interface Props {
  clientes: AdminClienteRow[] | null
}

const EMPTY_FORM: CampanaFormData = {
  nombre: '',
  mensaje: '',
  audiencia: 'todos',
  programadaPara: '',
}

export default function CampanasSection({ clientes }: Props) {
  const { campanas, guardar, eliminar, duplicar } = useCampanas()
  const [form, setForm] = useState<CampanaFormData>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)

  const destinatarios = countAudience(clientes, form.audiencia)
  const segmentos = estimateSmsSegments(form.mensaje)

  const resumen = useMemo(() => ({
    total: campanas.length,
    borradores: campanas.filter((campana) => campana.estado === 'borrador').length,
    preparadas: campanas.filter((campana) => campana.estado === 'preparada').length,
  }), [campanas])

  const updateField = <K extends keyof CampanaFormData>(key: K, value: CampanaFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const guardarCampana = (estado: CampanaEstado) => {
    guardar(form, estado, editingId)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const editar = (campana: Campana) => {
    setEditingId(campana.id)
    setForm({
      nombre: campana.nombre,
      mensaje: campana.mensaje,
      audiencia: campana.audiencia,
      programadaPara: campana.programadaPara,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicion = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone size={22} className="text-[#D4AF37]" />
            <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Campañas
            </h2>
          </div>
          <p className="text-sm text-[#9A7B50] mt-1">
            Prepara campañas de mensajes de texto y déjalas listas para conectar el proveedor SMS.
          </p>
        </div>

        <div className="rounded-xl border border-[#eab308]/25 bg-[#eab308]/8 px-4 py-3 max-w-xl">
          <p className="text-xs text-[#C4A97A] leading-relaxed">
            <strong className="text-[#eab308]">Modo preparación:</strong> todavía no se envían mensajes reales.
            Las campañas se guardan localmente en este navegador hasta reemplazar este almacenamiento por la API.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: resumen.total },
          { label: 'Borradores', value: resumen.borradores },
          { label: 'Preparadas', value: resumen.preparadas },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#D4AF37]/12 p-4" style={{ background: '#121009' }}>
            <p className="text-xl font-black text-[#F5E6C8]">{item.value}</p>
            <p className="text-xs text-[#6B5D3F] mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] gap-6 mb-8">
        <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-[#F5E6C8]">
                {editingId ? 'Editar campaña' : 'Nueva campaña'}
              </h3>
              <p className="text-xs text-[#6B5D3F] mt-1">Sin validaciones de proveedor por ahora.</p>
            </div>
            {editingId && (
              <button type="button" onClick={cancelarEdicion} className="text-xs text-[#9A7B50] hover:text-[#D4AF37]">
                Cancelar edición
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block md:col-span-2">
              <span className="block text-xs text-[#9A7B50] mb-2">Nombre de la campaña</span>
              <input
                value={form.nombre}
                onChange={(e) => updateField('nombre', e.target.value)}
                placeholder="Ej. Bono pendiente - fin de semana"
                className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60"
              />
            </label>

            <label className="block">
              <span className="block text-xs text-[#9A7B50] mb-2">Audiencia</span>
              <select
                value={form.audiencia}
                onChange={(e) => updateField('audiencia', e.target.value as CampanaFormData['audiencia'])}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 outline-none focus:border-[#D4AF37]/60"
              >
                <option value="todos">Todos los clientes</option>
                <option value="bono_pendiente">Clientes con bono pendiente</option>
                <option value="sin_bono">Clientes sin bono</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-xs text-[#9A7B50] mb-2">Programar para</span>
              <input
                type="datetime-local"
                value={form.programadaPara}
                onChange={(e) => updateField('programadaPara', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 outline-none focus:border-[#D4AF37]/60"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs text-[#9A7B50]">Mensaje SMS</span>
                <span className="text-xs text-[#6B5D3F]">
                  {form.mensaje.length} caracteres · {segmentos} segmento{segmentos === 1 ? '' : 's'} estimado{segmentos === 1 ? '' : 's'}
                </span>
              </div>
              <textarea
                rows={5}
                value={form.mensaje}
                onChange={(e) => updateField('mensaje', e.target.value)}
                placeholder="Escribe aquí el mensaje que recibirá el cliente..."
                className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#0a0805] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60 resize-y"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={() => guardarCampana('borrador')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#C4A97A] border border-[#D4AF37]/25 hover:border-[#D4AF37]/55 hover:text-[#D4AF37] transition-all"
            >
              Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => guardarCampana('preparada')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#171107] bg-[#D4AF37] hover:brightness-110 transition-all"
            >
              <Send size={15} /> Guardar como preparada
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
          <h3 className="font-bold text-[#F5E6C8] mb-4">Resumen de envío</h3>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/10 p-3 bg-black/10">
              <Users size={18} className="text-[#D4AF37]" />
              <div>
                <p className="text-xs text-[#6B5D3F]">Destinatarios actuales</p>
                <p className="text-lg font-bold text-[#F5E6C8]">{destinatarios}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/10 p-3 bg-black/10">
              <CalendarClock size={18} className="text-[#D4AF37]" />
              <div>
                <p className="text-xs text-[#6B5D3F]">Programación</p>
                <p className="text-sm font-semibold text-[#C4A97A]">{formatScheduledDate(form.programadaPara)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/10 p-4 bg-black/10">
              <p className="text-xs text-[#6B5D3F] mb-2">Vista previa</p>
              <p className="text-sm text-[#C4A97A] leading-relaxed whitespace-pre-wrap min-h-16">
                {form.mensaje || 'El mensaje aparecerá aquí mientras lo redactas.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-[#F5E6C8]">Campañas guardadas</h3>
            <p className="text-xs text-[#6B5D3F] mt-1">Persisten en localStorage hasta conectar el backend.</p>
          </div>
        </div>

        {campanas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4AF37]/20 py-12 text-center" style={{ background: '#121009' }}>
            <Megaphone size={28} className="text-[#6B5D3F] mx-auto mb-3" />
            <p className="text-sm text-[#9A7B50]">Todavía no has creado campañas.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {campanas.map((campana) => {
              const audienceCount = countAudience(clientes, campana.audiencia)
              return (
                <div key={campana.id} className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h4 className="font-bold text-[#F5E6C8] truncate">{campana.nombre || 'Campaña sin nombre'}</h4>
                        <StatusBadge
                          label={campana.estado === 'preparada' ? 'Preparada' : 'Borrador'}
                          color={campana.estado === 'preparada' ? '#22c55e' : '#eab308'}
                        />
                      </div>
                      <p className="text-xs text-[#6B5D3F]">
                        {AUDIENCIA_LABELS[campana.audiencia]} · {audienceCount} destinatarios actuales
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#C4A97A] leading-relaxed whitespace-pre-wrap mb-4 min-h-10">
                    {campana.mensaje || 'Sin mensaje definido.'}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#D4AF37]/10">
                    <span className="text-xs text-[#6B5D3F]">{formatScheduledDate(campana.programadaPara)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editar(campana)}
                        title="Editar"
                        className="p-2 rounded-lg text-[#9A7B50] hover:text-[#D4AF37] hover:bg-[#D4AF37]/8 transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicar(campana.id)}
                        title="Duplicar"
                        className="p-2 rounded-lg text-[#9A7B50] hover:text-[#D4AF37] hover:bg-[#D4AF37]/8 transition-all"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(campana.id)}
                        title="Eliminar"
                        className="p-2 rounded-lg text-[#9A7B50] hover:text-red-400 hover:bg-red-500/8 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
