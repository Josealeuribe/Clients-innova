import type { Dispatch, SetStateAction } from 'react'
import type { Page } from '@/shared/types/navigation'

// La recuperación va por pasos y no en una sola pantalla: el cliente escribe
// el correo, se va a su bandeja, vuelve con el código y recién entonces elige
// la contraseña.
export type LoginStep = 'login' | 'forgot' | 'forgot-code' | 'forgot-new' | 'forgot-done'

export interface LoginPageProps {
  navigate: (page: Page) => void
}

export type SetLoginStep = Dispatch<SetStateAction<LoginStep>>
export type SetLoading = Dispatch<SetStateAction<boolean>>
