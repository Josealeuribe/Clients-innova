import type { PromoBingo } from '@/shared/api/types'

// DATOS DE RESPALDO DE LA CAMPAÑA DEL BINGO
//
// POR QUÉ EXISTE ESTA COPIA
//
// La fuente de verdad es el servidor (server/src/config/promoBingo.ts), que los
// sirve en GET /api/promocion/bingo. Pero el frontend y la API son dos
// servicios que se despliegan por separado, y mientras la API no traiga ese
// endpoint la respuesta es un 404.
//
// Sin respaldo, ese 404 hacía desaparecer la promoción COMPLETA de las tres
// vistas — banner, ficha del evento, chip del bono y modal — sin ningún aviso,
// porque todo cuelga de un único `if (!promo) return null`. La campaña se veía
// como si no se hubiera implementado.
//
// Un bloque promocional no puede depender de que un endpoint nuevo esté arriba.
// Estos son datos estáticos de una campaña con fecha: caben perfectamente en el
// bundle y así la promoción se ve siempre. Cuando la API responde, MANDA la API
// (ver usePromoBingo): esta copia solo cubre el hueco.
//
// SI CAMBIA ALGO DE LA CAMPAÑA hay que tocar los dos sitios. Es el precio de
// que la vista no dependa del despliegue, y está acotado a esta constante.
export const PROMO_BINGO_RESPALDO: PromoBingo = {
  activa: true,
  casino: 'ventura-plaza',
  // Mismo instante que el servidor: 5 de septiembre de 2026, 5:00 p. m. en
  // Colombia. El offset -05:00 va explícito; sin él, el navegador lo
  // interpretaría en el huso del equipo.
  eventoEn: '2026-09-05T17:00:00-05:00',
  presentador: 'Iván Lalinde',
  instagramUrl: 'https://www.instagram.com/reel/Dc17B6uMu9z/?igsi=MzRlODBiNWFlZA==',
  premioEvento: {
    nombre: 'Yamaha Crypton FINN 115 · modelo 2027',
    gancho: '¡Se juega una moto 0 km!',
    descripcion:
      '¡Una Yamaha Crypton FINN 115 modelo 2027, 0 km, busca dueño! Participa en nuestro bingo y asegura tu oportunidad de ganarla. Cada cartón te acerca a estrenar. ¡No te quedes sin el tuyo!',
  },
  identificador: 'bingo-ventura-2026-09-05',
  sede: {
    clave: 'ventura-plaza',
    nombre: 'Gran Casino Cúcuta Ventura Plaza',
    direccion: 'C.C Ventura Plaza, local 228',
  },
  premio: {
    clave: 'carton-bingo',
    nombre: 'Cartón Bingo — 5 de septiembre 2026',
    detalle:
      'Cartón para Bingo — Casino Ventura Plaza — 5 de septiembre de 2026. ' +
      '¡Una Yamaha Crypton FINN 115 modelo 2027, 0 km, busca dueño! Participa en nuestro bingo y asegura tu oportunidad de ganarla. Cada cartón te acerca a estrenar. ¡No te quedes sin el tuyo!' +
      'Bingo cantado por Iván Lalinde a las 5:00 p. m. ' +
      'Válido únicamente en Casino Ventura Plaza.',
  },
  consultadoEn: new Date().toISOString(),
}

// La campaña se apaga sola al pasar la hora del evento, igual que en el
// servidor: un cartón anunciado después de que el bingo ya se cantó no le sirve
// a nadie. Se evalúa aquí para que el respaldo también caduque.
export function respaldoVigente(ahora: Date = new Date()): boolean {
  return (
    PROMO_BINGO_RESPALDO.activa &&
    ahora.getTime() <= new Date(PROMO_BINGO_RESPALDO.eventoEn).getTime()
  )
}
