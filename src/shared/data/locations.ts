export interface ScheduleLine {
  days: string
  hours: string
}

export interface Venue {
  name: string
  address: string
  city: string
  schedule: ScheduleLine[]
}

export const VENUES: Venue[] = [
  {
    name: 'Gran Casino Cúcuta Av 5',
    address: 'AV 5 9 30 38 Centro',
    city: 'Cúcuta',
    schedule: [
      { days: 'Lunes - Viernes', hours: '8:00 a.m. - 10:00 p.m.' },
      { days: 'Domingos y Festivos', hours: '8:00 a.m. - 6:00 p.m.' },
    ],
  },
  {
    name: 'Gran Casino Cúcuta Avenida 0',
    address: 'AV 0 13 4 La Playa',
    city: 'Cúcuta',
    schedule: [
      { days: 'Lunes - Sábado', hours: '11:00 a.m. - 6:00 a.m.' },
      { days: 'Domingos y Festivos', hours: '3:00 p.m. - 3:00 a.m.' },
    ],
  },
  {
    name: 'Gran Casino Cúcuta No. 2',
    address: 'CL 10 0 E 92 L N2 - 28 C.C Ventura Plaza',
    city: 'Cúcuta',
    schedule: [
      { days: 'Lunes - Viernes', hours: '10:00 a.m. - 1:00 a.m.' },
      { days: 'Domingos y Festivos', hours: '11:00 a.m. - 12:00 p.m.' },
    ],
  },
]

export interface CityCoord {
  city: string
  lat: number
  lng: number
}

export const CITY_COORDS: CityCoord[] = [{ city: 'Cúcuta', lat: 7.8891, lng: -72.5079 }]

export interface CityGroup {
  city: string
  lat: number
  lng: number
  venues: Venue[]
}

export function groupVenuesByCity(venues: Venue[]): CityGroup[] {
  return CITY_COORDS.map(({ city, lat, lng }) => ({
    city,
    lat,
    lng,
    venues: venues.filter((venue) => venue.city === city),
  })).filter((group) => group.venues.length > 0)
}
