import type { Page } from '@/shared/types/navigation'

export interface RegistrationPageProps {
  navigate: (page: Page) => void
  prize: string | null
  ticket: string | null
}

export type RegistrationStep = 1 | 2 | 3 | 4

export interface RegistrationErrors {
  nombres: string
  apellidos: string
  docType: string
  docNum: string
  birth: string
  phone: string
  dept: string
  city: string
  email: string
  passConfirm: string
}
