import FormInput from '../components/FormInput'
import PasswordField from '../components/PasswordField'

interface Props {
  email: string
  setEmail: (value: string) => void
  emailError: string
  checkingEmail: boolean

  pass: string
  setPass: (value: string) => void
  passConfirm: string
  setPassConfirm: (value: string) => void
  showPass: boolean
  setShowPass: (value: boolean) => void
  passStrength: number
  passConfirmError: string
}

export default function AccessDataSection(props: Props) {
  return (
    <div className="flex flex-col gap-4">
      <FormInput
        label="Correo Electrónico"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        value={props.email}
        onChange={props.setEmail}
        error={props.emailError}
        checking={props.checkingEmail}
      />

      <PasswordField
        pass={props.pass}
        setPass={props.setPass}
        passConfirm={props.passConfirm}
        setPassConfirm={props.setPassConfirm}
        showPass={props.showPass}
        setShowPass={props.setShowPass}
        passStrength={props.passStrength}
        passConfirmError={props.passConfirmError}
      />
    </div>
  )
}
