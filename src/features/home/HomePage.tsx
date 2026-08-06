import type { Page } from '@/shared/types/navigation'
import { Clock, MapPin, PartyPopper } from 'lucide-react'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
import Carousel from '@/shared/components/Carousel'
import LocationsMap from '@/shared/components/LocationsMap'
import { VENUES, comoLlegarUrl } from '@/shared/data/locations'
import avenida5Video from '@/shared/assets/videos/gran-casino-avenida-5.mp4'
import venturaVideo from '@/shared/assets/videos/gran-casino-ventura.mp4'
import ruletaImg from '@/shared/assets/images/ruleta-img-modal.avif'
import bingoImg from '@/shared/assets/images/bingo-modal.avif'
import tragamonedasImg from '@/shared/assets/images/tragamonedas-modal.avif'
import granCasino4 from '@/shared/assets/images/imagen-casino-cucuta-4.jpg'
import cartasImg from '@/shared/assets/images/cartas-modal.avif'
import ruletaDifumImg from '@/shared/assets/images/ruleta-difum.avif'
import premiosDifumImg from '@/shared/assets/images/premios-difum.avif'
import faqDifumImg from '@/shared/assets/images/signo-pregunta-difum.avif'
import casinoFloorImg from '@/shared/assets/images/tragamonedas-modal.avif'
import casinoFloorImg2 from '@/shared/assets/images/image-copy.png'
import avenida0Video from '@/shared/assets/videos/gran-casino-avenida-0.mp4'
import imageCarrousel from '@/shared/assets/images/image-casino-carrousel.avif'
import imageCarrousel2 from '@/shared/assets/images/imagen-carroussel-2.avif'
import { MarqueeBanner } from '@/features/banner/MarqueeBanner';
import imagenCucuta from '@/shared/assets/images/imagen-casino-cucuta-1.jpg'
import imagenCucuta2 from '@/shared/assets/images/imagen-casino-cucuta-2.jpg'
import imagenCucuta5  from '@/shared/assets/images/imagen-casino-cucuta-5.jpg'
import imagenCucuta6 from '@/shared/assets/images/gran-casino-cucuta-6.jpg'
import imagenCucuta3 from '@/shared/assets/images/imagen-casino-cucuta-3.jpg'

const VENUE_VIDEOS = [
  { title: 'Gran Casino Cúcuta No. 2 · Ventura Plaza', src: venturaVideo },
  { title: 'Gran Casino Cúcuta Av 0', src: avenida0Video },
  { title: 'Gran Casino Cúcuta Av 5', src: avenida5Video },
]

interface Props {
  navigate: (page: Page) => void
}

// Imágenes provisionales — se reemplazarán por fotografía oficial de cada sede.
const CAROUSEL_SLIDES = [
  {
    title: 'Vive la Experiencia Gran Casino',
    subtitle:
      'Descubre en Cúcuta un lugar creado para disfrutar, compartir y vivir momentos llenos de emoción. Atrévete a visitarnos y haz parte de nuestra comunidad.',
    image: imagenCucuta5,
    gradient: 'linear-gradient(135deg, #3D006B, #7B1515)',
  },
  {
    title: 'Tu Próxima Experiencia Comienza Aquí',
    subtitle:
      'Visita nuestras modernas salas de juego y disfruta de un ambiente cómodo, seguro y lleno de entretenimiento para compartir momentos inolvidables.',
    image: imageCarrousel2,
    gradient: 'linear-gradient(135deg, #7B1515, #8A6000)',
  },

  {
    title: 'Siempre Hay Algo Nuevo por Vivir',
    subtitle:
      'Torneos, noches temáticas, celebraciones y eventos especiales te esperan. Únete a Gran Casino y descubre experiencias creadas para sorprenderte.',
    image: imagenCucuta2,
    gradient: 'linear-gradient(135deg, #0D3B0D, #002B70)',
  },

  {
    title: 'Siente la Emoción del Bingo en Vivo',
    subtitle:
      'Disfruta cada número, comparte la emoción y participa en jornadas de bingo con grandes premios y experiencias pensadas para nuestros socios.',
    image: imagenCucuta,
    gradient: 'linear-gradient(135deg, #002B70, #3D006B)',
  },

];

const GAME_CARDS: { title: string; image: string; page: Page | null }[] = [
  { title: 'Ruleta', image: ruletaImg, page: 'roulette' },
  { title: 'Bingo', image: bingoImg, page: null },
  { title: 'Tragamonedas', image: granCasino4, page: null },
  { title: 'Cartas', image: cartasImg, page: null },
]

const FEATURE_CARDS: { label: string; image: string; action: (navigate: Props['navigate']) => void }[] = [
  { label: 'Ruleta de Premios', image: ruletaDifumImg, action: (navigate) => navigate('roulette') },
  { label: 'Premios', image: premiosDifumImg, action: (navigate) => navigate('prizes') },
  { label: 'Cómo Funciona', image: tragamonedasImg, action: (navigate) => navigate('how-it-works') },
  { label: 'Preguntas Frecuentes', image: faqDifumImg, action: (navigate) => navigate('faq') },
  { label: 'Nuestras Sedes', image: casinoFloorImg, action: () => document.getElementById('sedes')?.scrollIntoView({ behavior: 'smooth' }) },
  { label: 'Eventos', image: casinoFloorImg2, action: () => document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth' }) },
]

// Fotos provisionales de sedes — se reemplazarán por fotografía real de cada casino.
const VENUE_PHOTOS = [imagenCucuta6, imagenCucuta5, imagenCucuta3 ]

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mb-10 sm:mb-12">
      <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-3">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-black text-[#F5E6C8]">{title}</h2>
      <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
    </div>
  )
}

export default function HomePage({ navigate }: Props) {

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <div className="flex-1 pt-28 md:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
              BIENVENIDO A
            </p>

            <h1 className="mb-4 text-4xl font-black text-[#F5E6C8] md:text-5xl">
              GRAN CASINO
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#9A7B50]">
              Vive una experiencia de entretenimiento diferente en nuestras salas de
              juego en Cúcuta. Disfruta momentos inolvidables, beneficios exclusivos y
              toda la emoción de Gran Casino en un ambiente seguro y responsable.
            </p>

            <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-[#D4AF37]">
              Atrévete a visitarnos y descubre todo lo que tenemos preparado para ti.
            </p>
          </div>
        </div>

        <MarqueeBanner />

        {/* Carrusel a todo el ancho de la página */}
        <Carousel slides={CAROUSEL_SLIDES} />

        <MarqueeBanner />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <SectionHeading eyebrow="ACCESOS RÁPIDOS" title="Explora Gran Casino Cucuta" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {FEATURE_CARDS.map((card) => (
              <button
                key={card.label}
                type="button"
                onClick={() => card.action(navigate)}
                className="group relative h-24 sm:h-28 rounded-2xl overflow-hidden border border-[#D4AF37]/15 hover:border-[#D4AF37]/50 transition-all"
              >
                <img
                  src={card.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-md transition-transform duration-300 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-black/45" />
                <p className="relative h-full flex items-center justify-center text-center font-semibold text-[#F5E6C8] text-xs sm:text-sm px-2">
                  {card.label}
                </p>
              </button>
            ))}
          </div>


        </div>

        <div id="sedes" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <SectionHeading eyebrow={`${VENUES.length} SEDES EN CÚCUTA`} title="Nuestras Sedes" />
          <div className="grid lg:grid-cols-2 gap-8">
            <LocationsMap height={420} />
            {/* Una tarjeta por sede, en el mismo orden que los marcadores del
                mapa, para que se puedan cotejar de un vistazo. */}
            <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2">
              {VENUES.map((venue) => (
                <div
                  key={venue.clave}
                  className="rounded-2xl p-5 border border-[#D4AF37]/15"
                  style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
                >
                  <h3 className="text-[#D4AF37] font-bold">{venue.name}</h3>
                  <p className="text-sm text-[#9A7B50] mt-0.5">{venue.address}</p>
                  <ul className="mt-3 space-y-0.5">
                    {venue.schedule.map((line) => (
                      <li key={line.days} className="text-xs text-[#6B5D3F] flex gap-2">
                        <Clock size={13} className="text-[#D4AF37]/70 flex-shrink-0 mt-0.5" />
                        <span>
                          <span className="font-medium text-[#8D7A55]">{line.days}:</span> {line.hours}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={comoLlegarUrl(venue)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#F0C847] underline"
                  >
                    <MapPin size={13} /> Cómo llegar
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <SectionHeading eyebrow="CONOCE NUESTROS ESPACIOS" title="Fotos de Casinos" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VENUES.slice(0, 6).map((venue, index) => (
              <div
                key={venue.name}
                className="rounded-2xl overflow-hidden border border-[#D4AF37]/15"
                style={{ background: '#121009' }}
              >
                <img
                  src={VENUE_PHOTOS[index % VENUE_PHOTOS.length]}
                  alt={venue.name}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4 bg-[#121009]">
                  <p className="font-semibold text-[#F5E6C8] text-sm">{venue.name}</p>
                  <p className="text-xs text-[#6B5D3F] mt-1">{venue.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            eyebrow="CONÓCENOS POR DENTRO"
            title="Nuestras Sedes en Video"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {VENUE_VIDEOS.map((venue, index) => {
              const isLastVideo = index === VENUE_VIDEOS.length - 1;
              const isOddAmount = VENUE_VIDEOS.length % 2 !== 0;

              return (
                <div
                  key={venue.title}
                  className={`
            w-full
            max-w-[300px]
            justify-self-center
            overflow-hidden
            rounded-2xl
            border border-[#D4AF37]/15
            shadow-[0_12px_35px_rgba(0,0,0,0.35)]
            transition-all duration-300
            hover:-translate-y-1
            hover:border-[#D4AF37]/35
            hover:shadow-[0_16px_45px_rgba(0,0,0,0.5)]
            ${isLastVideo && isOddAmount
                      ? 'md:col-span-2 md:justify-self-center'
                      : ''
                    }
          `}
                  style={{
                    background: 'linear-gradient(160deg, #1C1810, #121009)',
                  }}
                >
                  <video
                    src={venue.src}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="
              block
              h-auto
              w-full
              bg-transparent
              object-contain
            "
                  />

                  <div className="p-4">
                    <p className="text-center text-sm font-semibold text-[#F5E6C8]">
                      {venue.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <SectionHeading eyebrow="DIVERSIÓN GARANTIZADA" title="Videojuegos" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {GAME_CARDS.map((game) => (
              <div
                key={game.title}
                onClick={() => game.page && navigate(game.page)}
                className={`group relative aspect-square rounded-2xl overflow-hidden border border-[#D4AF37]/15 ${game.page ? 'cursor-pointer hover:border-[#D4AF37]/50 transition-all' : ''}`}
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center font-semibold text-[#F5E6C8] text-sm">
                  {game.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div id="eventos" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <SectionHeading eyebrow="AGENDA" title="Eventos Próximos" />
          <div
            className="max-w-xl mx-auto rounded-2xl p-10 border border-[#D4AF37]/15 text-center"
            style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
          >
            <PartyPopper size={44} className="text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#F5E6C8] mb-2">¡Próximamente!</h3>
            <p className="text-sm text-[#9A7B50] leading-relaxed">
              Estamos preparando nuevos eventos y noches especiales en nuestras sedes. Muy pronto encontrarás aquí
              toda la agenda con fechas y detalles.
            </p>
          </div>
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  )
}
