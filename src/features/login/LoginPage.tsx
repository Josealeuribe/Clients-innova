import LoginLayout from './components/LoginLayout'
import { useLoginAccess } from './hooks/useLoginAccess'
import { useLoginUiState } from './hooks/useLoginUiState'
import { usePasswordRecovery } from './hooks/usePasswordRecovery'
import type { LoginPageProps } from './login.types'
import ForgotCodeSection from './sections/ForgotCodeSection'
import ForgotDoneSection from './sections/ForgotDoneSection'
import ForgotEmailSection from './sections/ForgotEmailSection'
import ForgotNewPasswordSection from './sections/ForgotNewPasswordSection'
import LoginSection from './sections/LoginSection'


export default function LoginPage({ navigate }: LoginPageProps) {
  const ui = useLoginUiState()
  const access = useLoginAccess({ navigate, setLoading: ui.setLoading })
  const recovery = usePasswordRecovery({ setStep: ui.setStep, setLoading: ui.setLoading })

  return (
    <LoginLayout
      step={ui.step}
      resetEmail={recovery.email}
      vigenciaMinutos={recovery.vigenciaMinutos}
    >
      {ui.step === 'login' && (
        <LoginSection
          navigate={navigate}
          email={access.email}
          setEmail={access.setEmail}
          pass={access.pass}
          setPass={access.setPass}
          showPass={ui.showPass}
          setShowPass={ui.setShowPass}
          remember={access.remember}
          setRemember={access.setRemember}
          loading={ui.loading}
          error={access.error}
          onLogin={access.ingresar}
          onForgot={() => recovery.iniciar(access.email)}
        />
      )}

      {ui.step === 'forgot' && (
        <ForgotEmailSection
          email={recovery.email}
          setEmail={recovery.setEmail}
          loading={ui.loading}
          error={recovery.error}
          onSendCode={() => recovery.pedirCodigo()}
          onBack={recovery.volverAlLogin}
        />
      )}

      {ui.step === 'forgot-code' && (
        <ForgotCodeSection
          code={recovery.code}
          setCode={recovery.actualizarCodigo}
          codeComplete={recovery.codigoCompleto}
          loading={ui.loading}
          error={recovery.error}
          notice={recovery.aviso}
          onVerify={recovery.verificarCodigo}
          onResend={() => recovery.pedirCodigo(true)}
          onChangeEmail={recovery.cambiarCorreo}
        />
      )}

      {ui.step === 'forgot-new' && (
        <ForgotNewPasswordSection
          newPass={recovery.newPass}
          setNewPass={recovery.setNewPass}
          newPassConfirm={recovery.newPassConfirm}
          setNewPassConfirm={recovery.setNewPassConfirm}
          showPass={ui.showPass}
          setShowPass={ui.setShowPass}
          loading={ui.loading}
          error={recovery.error}
          onSave={recovery.guardarNuevaPassword}
          onCancel={recovery.volverAlLogin}
        />
      )}

      {ui.step === 'forgot-done' && (
        <ForgotDoneSection onBackToLogin={recovery.volverAlLogin} />
      )}
    </LoginLayout>
  )
}
