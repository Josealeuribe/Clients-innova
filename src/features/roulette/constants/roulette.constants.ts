export const ROULETTE_NUMBERS = [
  '0', '32', '15', '19', '4', '21', '2', '25', '17', '34',
  '6', '27', '13', '36', '11', '30', '8', '23', '10', '5',
  '24', '16', '33', '1', '20', '14', '31', '9', '22', '18',
  '29', '7', '28', '12', '35', '3', '26',
] as const

export const RED_NUMBERS = new Set([
  '32', '19', '21', '25', '34', '27', '36', '30', '23',
  '5', '16', '1', '14', '9', '18', '7', '12', '3',
])

export const TOTAL_POCKETS = ROULETTE_NUMBERS.length
export const SEGMENT_ANGLE = (Math.PI * 2) / TOTAL_POCKETS

/**
 * La cámara está ubicada en Z positivo. El ángulo -PI/2 corresponde a la
 * parte posterior/superior de la ruleta, donde está el marcador dorado.
 */
export const POINTER_WORLD_ANGLE = -Math.PI / 2

export const ROULETTE_COLORS = {
  red: '#B51F1F',
  redDark: '#721010',
  black: '#17130E',
  blackLight: '#2A231A',
  green: '#176B36',
  greenLight: '#29945A',
  gold: '#D4AF37',
  goldLight: '#F2D37A',
  goldDark: '#705019',
  wood: '#32140B',
  woodLight: '#6A2D16',
  woodDark: '#160804',
} as const