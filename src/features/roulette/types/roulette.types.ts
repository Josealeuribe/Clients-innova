export interface RouletteSpinCommand {
  /** Identificador único para que un mismo giro no se ejecute dos veces. */
  id: number
  /** Índice del bolsillo ganador, entre 0 y 36. */
  targetPocket: number
  /** Duración total de la animación en milisegundos. */
  durationMs?: number
}

export interface Roulette3DProps {
  spinCommand?: RouletteSpinCommand | null
  onSpinComplete?: (targetPocket: number) => void
  preview?: boolean
  className?: string
  quality?: 'medium' | 'high'
}