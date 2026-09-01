import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import { DOCUMENT_TYPES } from '../utils/registrationContent'

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
        onChange={props.setDocType}
        placeholder="Selecciona..."
        error={props.errors.docType}
      />

      <FormInput
        label="Número de Documento"
        placeholder="1012345678"
        value={props.docNum}
        onChange={props.setDocNum}
        error={props.errors.docNum}
        checking={props.checkingDocNum}
      />

      <FormInput
        label="Fecha de Nacimiento"
        type="date"
        placeholder=""
        value={props.birth}
        onChange={props.setBirth}
        error={props.errors.birth}
      />

      <FormInput
        label="Número de Celular"
        type="tel"
        placeholder="+57 300 1234567"
        value={props.phone}
        onChange={props.setPhone}
        error={props.errors.phone}
      />
    </div>
  )
}
