import { useEffect, useState } from 'react'
import type { Campana, CampanaEstado, CampanaFormData } from '../admin.types'
import { loadCampanas, saveCampanas } from '../services/campanas.storage'


function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `campana-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useCampanas() {
  const [campanas, setCampanas] = useState<Campana[]>(() => loadCampanas())

  useEffect(() => {
    saveCampanas(campanas)
  }, [campanas])

  const guardar = (
    data: CampanaFormData,
    estado: CampanaEstado,
    editingId?: string | null,
  ) => {
    const now = new Date().toISOString()

    if (editingId) {
      setCampanas((prev) =>
        prev.map((campana) =>
          campana.id === editingId
            ? { ...campana, ...data, estado, updatedAt: now }
            : campana,
        ),
      )
      return
    }

    setCampanas((prev) => [
      {
        ...data,
        id: createId(),
        estado,
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ])
  }

  const eliminar = (id: string) => {
    setCampanas((prev) => prev.filter((campana) => campana.id !== id))
  }

  const duplicar = (id: string) => {
    const original = campanas.find((campana) => campana.id === id)
    if (!original) return

    const now = new Date().toISOString()
    setCampanas((prev) => [
      {
        ...original,
        id: createId(),
        nombre: `${original.nombre || 'Campaña'} - copia`,
        estado: 'borrador',
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ])
  }

  return { campanas, guardar, eliminar, duplicar }
}
