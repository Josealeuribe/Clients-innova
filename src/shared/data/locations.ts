export interface ScheduleLine {
  days: string
  hours: string
}

export interface Venue {
  /** Misma clave que la tabla `sedes` del backend: enlaza esta ficha con la
   *  sede a la que pertenecen los premios y los canjes. */
  clave: string
  name: string
  address: string
  city: string
  /** [latitud, longitud] del punto exacto en el mapa. */
  coords: [number, number]
  schedule: ScheduleLine[]
}

// COORDENADAS
//
// Geocodificadas contra OpenStreetMap (Nominatim), no estimadas a ojo. El
// nivel de certeza no es el mismo en las tres y conviene saberlo:
//
//   · ventura-plaza  El centro comercial está mapeado por nombre en OSM.
//                    Punto confiable.
//   · avenida-0      OSM tiene un POI etiquetado como casino justo sobre la
//                    Avenida 0 en el Centro. Coincide con la dirección.
//   · av-5           Punto real sobre la Avenida 5 en El Centro, pero la
//                    numeración exacta (9-40) no está mapeada: puede estar
//                    corrido una o dos cuadras. ES EL QUE CONVIENE VERIFICAR.
//
// Para corregir una: Google Maps → ubica la sede → clic derecho sobre la
// entrada → "Copiar coordenadas" → pega el par en `coords`.
export const VENUES: Venue[] = [
  {
    clave: 'av-5',
    name: 'Gran Casino Cúcuta Av. 5',
    address: 'AV 5 No. 9-40',
    city: 'Cúcuta',
    coords: [7.885395, -72.503575],
    schedule: [
      { days: 'Lunes - Viernes', hours: '8:00 a.m. - 10:00 p.m.' },
      { days: 'Domingos y Festivos', hours: '8:00 a.m. - 6:00 p.m.' },
    ],
  },
  {
    clave: 'avenida-0',
    name: 'Gran Casino Cúcuta Av. 0',
    address: 'Av. 0 No. 13-04',
    city: 'Cúcuta',
    coords: [7.884325, -72.49837],
    schedule: [
      { days: 'Lunes - Sábado', hours: '11:00 a.m. - 6:00 a.m.' },
      { days: 'Domingos y Festivos', hours: '3:00 p.m. - 3:00 a.m.' },
    ],
  },
  {
    clave: 'ventura-plaza',
    name: 'Gran Casino Cúcuta Ventura Plaza',
    address: 'C.C Ventura Plaza local 228',
    city: 'Cúcuta',
    coords: [7.887792, -72.496673],
    schedule: [
      { days: 'Lunes - Viernes', hours: '10:00 a.m. - 1:00 a.m.' },
      { days: 'Domingos y Festivos', hours: '11:00 a.m. - 12:00 p.m.' },
    ],
  },
]

// Enlace a Google Maps para "Cómo llegar". Se arma con las coordenadas y no
// con la dirección en texto: el buscador de Maps a veces no acierta con
// direcciones colombianas, pero un par de coordenadas nunca falla.
export function comoLlegarUrl(venue: Venue): string {
  const [lat, lng] = venue.coords
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}
