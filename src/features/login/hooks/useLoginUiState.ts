import { useState } from 'react'
import type { LoginStep } from '../login.types'

export function useLoginUiState() {
  const [step, setStep] = useState<LoginStep>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  return {
    step,
    setStep,
    showPass,
    setShowPass,
    loading,
    setLoading,
  }
}
