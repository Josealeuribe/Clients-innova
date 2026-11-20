// Preguntas frecuentes, agrupadas por tema para los filtros de la vista.
//
// Lo que se dice aquí sobre la promoción debe coincidir con el backend: 5 giros
// por visitante (GIROS_MAXIMOS), un bono por persona, 30 minutos para
// registrarse (TICKET_TTL_MINUTES) y solo los bonos de $10.000, $20.000 y
// $50.000 (server/prisma/seed.ts).

export type FaqCategoria = 'promocion' | 'premios' | 'cuenta' | 'sedes' | 'juego-responsable'

export interface FaqItem {
  question: string
  answer: string
  categoria: FaqCategoria
}

export const FAQ_CATEGORIAS: { id: FaqCategoria; label: string }[] = [
  { id: 'promocion', label: 'La promoción' },
  { id: 'premios', label: 'Premios y bonos' },
  { id: 'cuenta', label: 'Registro y cuenta' },
  { id: 'sedes', label: 'Sedes' },
  { id: 'juego-responsable', label: 'Juego responsable' },
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    categoria: 'promocion',
    question: '¿Qué es "Gira y Gana"?',
    answer:
      'Es la promoción de bienvenida de Gran Casino Cúcuta: giras una ruleta digital, ganas un bono de juego y lo redimes en cualquiera de nuestras 3 sedes en Cúcuta.',
  },
  {
    categoria: 'promocion',
    question: '¿Cómo participo?',
    answer:
      'Entra a "Gira y Gana", presiona "Girar" (o tira de la palanca de la tragamonedas) y descubre tu premio. No necesitas registrarte para girar: el registro se pide solo para reservar el bono a tu nombre.',
  },
  {
    categoria: 'promocion',
    question: '¿Cuántas veces puedo girar la tragamonedas?',
    answer:
      'Tienes 5 giros. Ganas cuando caen tres símbolos iguales en la línea roja: tres cerezas son un bono de $10.000, tres campanas uno de $20.000 y tres sietes el de $50.000. Si ganas más de una vez te quedas con el bono mayor; una vez lo reclamas ya no puedes volver a girar, porque la promoción entrega un único bono por persona.',
  },
  {
    categoria: 'premios',
    question: '¿Qué premios puedo ganar?',
    answer:
      'Tres bonos de juego: $10.000, $20.000 y nuestro premio mayor de $50.000. Son créditos para jugar en nuestras sedes.',
  },
  {
    categoria: 'premios',
    question: '¿Los premios se entregan en efectivo?',
    answer:
      'No. Ningún premio se entrega en efectivo ni por transferencia. Los bonos son créditos de juego redimibles únicamente en la caja de nuestras sedes de Gran Casino Cúcuta.',
  },
  {
    categoria: 'premios',
    question: 'Tenía un premio que ya no aparece (bono de $5.000, cartón de bingo, entrada a evento o premio sorpresa). ¿Qué pasa con él?',
    answer:
      'Esos premios salieron del catálogo. Si tenías uno pendiente por redimir, se convirtió automáticamente en un bono de $10.000, con el mismo código y la misma sede. Puedes verlo en "Mi cuenta".',
  },
  {
    categoria: 'premios',
    question: '¿Cuánto tiempo tengo para reclamar mi premio?',
    answer:
      'Después de girar tienes 30 minutos para completar tu registro y dejar el bono reservado a tu nombre. Luego lo redimes en caja con tu documento antes de la fecha de vigencia que ves en la ruleta y en tu cuenta.',
  },
  {
    categoria: 'cuenta',
    question: '¿Qué necesito para registrarme?',
    answer:
      'Ser mayor de 18 años y tener a mano tu documento de identidad, celular y correo electrónico. Solo se permite un registro por persona y por documento.',
  },
  {
    categoria: 'cuenta',
    question: '¿Dónde veo mi bono y su código?',
    answer:
      'Inicia sesión y entra a "Mi cuenta": ahí ves el bono, su código de canje, la sede asignada y hasta cuándo puedes redimirlo.',
  },
  {
    categoria: 'cuenta',
    question: 'Olvidé mi contraseña, ¿qué hago?',
    answer:
      'En "Iniciar sesión" elige "Olvidé mi contraseña". Te enviaremos un código a tu correo para que crees una nueva.',
  },
  {
    categoria: 'sedes',
    question: '¿Dónde quedan las sedes?',
    answer:
      'Tenemos 3 sedes de Gran Casino Cúcuta: Ventura Plaza (C.C. Ventura Plaza, local 228), Av. 5 (Av. 5 No. 9-40) y Av. 0 (Av. 0 No. 13-04). Puedes verlas en el mapa del pie de página.',
  },
  {
    categoria: 'sedes',
    question: '¿En qué sede redimo mi bono?',
    answer:
      'Al registrarte se te asigna una sede, que ves en "Mi cuenta". Preséntate en la caja de esa sede con tu documento de identidad.',
  },
  {
    categoria: 'juego-responsable',
    question: '¿Necesito ser mayor de edad?',
    answer:
      'Sí. Nuestras promociones y salas son exclusivamente para mayores de 18 años, conforme a la regulación colombiana de juegos de suerte y azar.',
  },
  {
    categoria: 'juego-responsable',
    question: 'Siento que el juego se me está saliendo de las manos. ¿Qué hago?',
    answer:
      'No estás solo y pedir ayuda es gratis y confidencial. Llama a la línea nacional de salud mental 192 opción 4 o a nuestra línea 01-8000-111-444, y considera pedir tu autoexclusión en caja. En la sección "Juego Responsable" encuentras una autoevaluación rápida y más orientación.',
  },
  {
    categoria: 'juego-responsable',
    question: '¿Puedo pedir que no me dejen entrar a jugar?',
    answer:
      'Sí. Se llama autoexclusión: la solicitas en la caja de cualquiera de nuestras sedes con tu documento y eliges por cuánto tiempo.',
  },
]
