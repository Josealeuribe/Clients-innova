import { ApiError } from '@/shared/api/client'

export function mensajeApiError(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}
