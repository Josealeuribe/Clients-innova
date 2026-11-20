import DateField from '../components/DateField'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import { DOCUMENT_TYPES } from '../utils/registrationContent'
import { CEDULA, CEDULA_MAX, CELULAR_LARGO } from '../utils/registrationValidators'

interface Props {
  nombres: string
  setNombres: (value: string) => void
  apellidos: string
  setApellidos: (value: string) => void
  docType: string
  setDocType: (value: string) => void
  docNum: string
  setDocNum: (value: string) => void
  birth: string
  setBirth: (value: string) => void
  phone: string
  setPhone: (value: string) => void

  checkingDocNum: boolean

  errors: {
    nombres: string
    apellidos: string
    docType: string
    docNum: string
    birth: string
    phone: string
  }
}

export default function PersonalDataSection(props: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Nombres"
          placeholder="Juan Camilo"
          value={props.nombres}
          onChange={props.setNombres}
          error={props.errors.nombres}
        />

        <FormInput
          label="Apellidos"
          placeholder="Rodríguez"
          value={props.apellidos}
          onChange={props.setApellidos}
          error={props.errors.apellidos}
        />
      </div>

      <FormSelect
        label="Tipo de Documento"
        options={DOCUMENT_TYPES}
        value={props.docType}
        onChange={(tipo) => {
          props.setDocType(tipo)
          // Al pasar a cédula se recorta lo que exceda los 10 dígitos.
          if (tipo === CEDULA && props.docNum.length > CEDULA_MAX) props.setDocNum(props.docNum.slice(0, CEDULA_MAX))
        }}
        placeholder="Selecciona..."
        error={props.errors.docType}
      />

      <FormInput
        label="Número de Documento"
        placeholder="1012345678"
        value={props.docNum}
        onChange={props.setDocNum}
        soloNumeros
        maxLength={props.docType === CEDULA ? CEDULA_MAX : undefined}
        error={props.errors.docNum}
        checking={props.checkingDocNum}
      />

      <DateField
        label="Fecha de Nacimiento"
        value={props.birth}
        onChange={props.setBirth}
        error={props.errors.birth}
      />

      <FormInput
        label="Número de Celular"
        type="tel"
        placeholder="3001234567"
        value={props.phone}
        onChange={props.setPhone}
        soloNumeros
        maxLength={CELULAR_LARGO}
        error={props.errors.phone}
      />
    </div>
  )
}
