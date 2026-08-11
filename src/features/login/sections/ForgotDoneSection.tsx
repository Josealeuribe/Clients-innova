import LoginPrimaryButton from '../components/LoginPrimaryButton'

interface Props {
  onBackToLogin: () => void
}

export default function ForgotDoneSection({ onBackToLogin }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <LoginPrimaryButton onClick={onBackToLogin}>Iniciar sesión</LoginPrimaryButton>
    </div>
  )
}
