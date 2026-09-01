import FormSelect from '../components/FormSelect'

interface Props {
  dept: string
  setDept: (value: string) => void
  city: string
  setCity: (value: string) => void
  departamentos: string[]
  municipios: string[]
  ubicacionesCargadas: boolean
  ubicacionesError: string | null
  deptError: string
  cityError: string
}

export default function LocationSection({
  dept,
  setDept,
  city,
  setCity,
  departamentos,
  municipios,
  ubicacionesCargadas,
  ubicacionesError,
  deptError,
  cityError,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <FormSelect
        label="Departamento"
        options={departamentos}
        value={dept}
        onChange={(value) => {
          setDept(value)
          setCity('')
        }}
        placeholder={
          ubicacionesCargadas
            ? 'Selecciona un departamento...'
            : 'Cargando departamentos...'
        }
        disabled={!ubicacionesCargadas}
        error={deptError || ubicacionesError || ''}
      />

      <FormSelect
        label="Ciudad"
        options={municipios}
        value={city}
        onChange={setCity}
        disabled={!dept}
        placeholder={
          dept
            ? 'Selecciona una ciudad...'
            : 'Selecciona primero un departamento'
        }
        error={cityError}
      />

      {!dept && (
        <p className="text-[#6B5D3F] text-xs flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>

          Selecciona un departamento para activar la selección de ciudad.
        </p>
      )}
    </div>
  )
}
