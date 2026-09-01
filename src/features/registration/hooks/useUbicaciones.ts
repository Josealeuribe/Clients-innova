import { useEffect, useMemo, useState } from 'react'
import type { DepartamentoApi } from '@/shared/api/types'
import { registrationService } from '../services/registration.service'

export function useUbicaciones(dept: string) {
  const [ubicaciones, setUbicaciones] = useState<DepartamentoApi[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    registrationService
      .fetchUbicaciones()
      .then((res) => setUbicaciones(res.departamentos))
      .catch(() =>
        setError(
          'No se pudo cargar la lista de departamentos. Revisa tu conexión y recarga la página.',
        ),
      )
  }, [])

  const nombresDepartamentos = useMemo(
    () => ubicaciones.map((departamento) => departamento.nombre),
    [ubicaciones],
  )

  const municipiosDelDepartamento = useMemo(
    () => ubicaciones.find((departamento) => departamento.nombre === dept)?.municipios ?? [],
    [ubicaciones, dept],
  )

  return {
    ubicaciones,
    error,
    nombresDepartamentos,
    municipiosDelDepartamento,
  }
}
