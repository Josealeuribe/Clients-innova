import { useEffect, useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BellRing,
  Camera,
  Clock,
  Club,
  Disc3,
  Expand,
  Gift,
  Grid3x3,
  HelpCircle,
  MapPin,
  Navigation,
  PartyPopper,
  Play,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Cherry,
} from 'lucide-react'
import { FaInstagram } from 'react-icons/fa'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
import Carousel from '@/shared/components/Carousel'
import LocationsMap from '@/shared/components/LocationsMap'
import { Panel } from '@/shared/components/info/InfoPageShell'
import PremiosResumen from '@/shared/components/info/PremiosResumen'
import CuponesShowcase from '@/features/prizes/components/CuponesShowcase'
import { useBloquearScroll } from '@/shared/hooks/useBloquearScroll'
import { VENUES, comoLlegarUrl } from '@/shared/data/locations'
import avenida5Video from '@/shared/assets/videos/gran-casino-avenida-5.mp4'
import venturaVideo from '@/shared/assets/videos/gran-casino-ventura.mp4'
import avenida0Video from '@/shared/assets/videos/gran-casino-avenida-0.mp4'
import ruletaImg from '@/shared/assets/images/ruleta-img-modal.avif'
import bingoImg from '@/shared/assets/images/bingo-modal.avif'
import cartasImg from '@/shared/assets/images/cartas-modal.avif'
import tragamonedasImg from '@/shared/assets/images/tragamonedas-modal.avif'
import ruletaDifumImg from '@/shared/assets/images/ruleta-difum.avif'
import premiosDifumImg from '@/shared/assets/images/premios-difum.avif'
import faqDifumImg from '@/shared/assets/images/signo-pregunta-difum.avif'
import salaImg from '@/shared/assets/images/image.png'
import salaImg2 from '@/shared/assets/images/image-copy.png'
import imageCarrousel2 from '@/shared/assets/images/imagen-carroussel-2.avif'
import imagenCucuta from '@/shared/assets/images/imagen-casino-cucuta-1.jpg'
import imagenCucuta2 from '@/shared/assets/images/imagen-casino-cucuta-2.jpg'
import imagenCucuta3 from '@/shared/assets/images/imagen-casino-cucuta-3.jpg'
import imagenCucuta4 from '@/shared/assets/images/imagen-casino-cucuta-4.jpg'
import imagenCucuta5 from '@/shared/assets/images/imagen-casino-cucuta-5.jpg'
import imagenCucuta6 from '@/shared/assets/images/gran-casino-cucuta-6.jpg'
// WebP de "img-ficahrdo (1).png" (780 KB -> ~60 KB). Regenerar si cambia.
import fichardoCelebrando from '@/shared/assets/images/fichardo-celebrando.webp'
import fichardoBono from '@/shared/assets/images/fichardo-bono.png'
// Fichardo con el letrero "próximamente" (Eventos Próximos). Recorte sin el
// fondo negro de fichardo-proximamente.png, en webp para que pese ~70 KB.
import fichardoProximamente from '@/shared/assets/images/fichardo-proximamente.webp'
import { MarqueeBanner } from '@/features/banner/MarqueeBanner'

interface Props {
  navigate: (page: Page) => void
}

const GOLD = 'linear-gradient(135deg, #F0C847, #D4AF37 55%, #A0832A)'

const VENUE_VIDEOS = [
  { title: 'Ventura Plaza', sub: 'Gran Casino Cúcuta No. 2', src: venturaVideo },
  { title: 'Avenida 0', sub: 'Gran Casino Cúcuta', src: avenida0Video },
  { title: 'Avenida 5', sub: 'Gran Casino Cúcuta', src: avenida5Video },
]

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
]

const irA = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const ACCESOS: { label: string; desc: string; image: string; icon: LucideIcon; action: (navigate: Props['navigate']) => void }[] = [
  { label: 'Gira y Gana', desc: 'Tu bono de bienvenida', image: ruletaDifumImg, icon: Disc3, action: (n) => n('landing') },
  { label: 'Premios', desc: '$10.000, $20.000 y $50.000', image: premiosDifumImg, icon: Gift, action: (n) => n('prizes') },
  { label: 'Cómo Funciona', desc: 'De la ruleta a la caja', image: tragamonedasImg, icon: Workflow, action: (n) => n('how-it-works') },
  { label: 'Preguntas Frecuentes', desc: 'Resolvemos tus dudas', image: faqDifumImg, icon: HelpCircle, action: (n) => n('faq') },
  { label: 'Nuestras Sedes', desc: '3 casinos en Cúcuta', image: salaImg, icon: MapPin, action: () => irA('sedes') },
  { label: 'Eventos', desc: 'Agenda del club', image: salaImg2, icon: PartyPopper, action: () => irA('eventos') },
]

const JUEGOS: { title: string; desc: string; image: string; icon: LucideIcon; page: Page | null }[] = [
  { title: 'Ruleta', desc: 'La clásica de los casinos. Prueba la ruleta de bienvenida en línea.', image: ruletaImg, icon: Disc3, page: 'roulette' },
  { title: 'Bingo', desc: 'Jornadas en vivo con cartones dobles y grandes premios.', image: bingoImg, icon: Grid3x3, page: null },
  { title: 'Tragamonedas', desc: 'Máquinas modernas con temáticas para todos los gustos.', image: imagenCucuta4, icon: Cherry, page: null },
  { title: 'Cartas', desc: 'Mesas de juego para los amantes de la estrategia.', image: cartasImg, icon: Club, page: null },
]

// Foto de cada sede, en el orden de VENUES (av-5, avenida-0, ventura-plaza).
// Provisionales: se reemplazarán por fotografía real de cada casino.
const FOTO_SEDE = [imagenCucuta6, imagenCucuta5, imagenCucuta3]

const GALERIA = [imagenCucuta5, imagenCucuta2, imagenCucuta3, imagenCucuta, imagenCucuta6, imagenCucuta4]

function SectionHeading({ eyebrow, title, highlight, desc }: { eyebrow: string; title: string; highlight?: string; desc?: string }) {
  return (
    <div className="mb-10 text-center sm:mb-12">
      <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#D4AF37]">
        <span className="text-[#B52020]">♦</span> {eyebrow} <span className="text-[#B52020]">♥</span>
      </p>
      <h2 className="font-display text-3xl font-black text-[#F5E6C8] md:text-5xl">
        {title}
        {highlight && (
          <>
            {' '}
            <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {highlight}
            </span>
          </>
        )}
      </h2>
      <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      {desc && <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#C4A97A] md:text-base">{desc}</p>}
    </div>
  )
}

export default function HomePage({ navigate }: Props) {
  const [foto, setFoto] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-transparent">
      <div className="flex-1 pt-28 md:pt-32">
        {/* ================= ENCABEZADO ================= */}
        <section className="relative mx-auto w-full max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -top-32"
            style={{ background: 'radial-gradient(45% 60% at 75% 40%, rgba(212,175,55,0.14), transparent 70%), radial-gradient(40% 60% at 15% 30%, rgba(139,26,26,0.22), transparent 70%)' }}
          />
          <div className="relative mb-6">
            <BackButton />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <div className="text-center lg:text-left">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/8 px-4 py-1.5 text-xs font-bold tracking-widest text-[#D4AF37]">
                <Sparkles size={14} /> BIENVENIDO A <Sparkles size={14} />
              </span>
              <h1 className="font-display mb-5 text-5xl leading-[0.95] font-black text-[#F5E6C8] sm:text-6xl lg:text-7xl">
                Gran Casino{' '}
                <span
                  className="block"
                  style={{ background: 'linear-gradient(135deg, #F0C847 0%, #D4AF37 40%, #A0832A 70%, #D4AF37 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gold-shimmer 4s linear infinite' }}
                >
                  Cúcuta
                </span>
              </h1>
              <p className="mx-auto mb-4 max-w-xl text-base leading-relaxed text-[#C4A97A] md:text-lg lg:mx-0">
                Vive una experiencia de entretenimiento diferente en nuestras salas de juego en Cúcuta. Momentos
                inolvidables, beneficios exclusivos y toda la emoción de Gran Casino en un ambiente seguro y responsable.
              </p>
              <p className="mx-auto mb-8 max-w-xl text-lg font-semibold text-[#F0C847] lg:mx-0">
                Atrévete a visitarnos y descubre todo lo que tenemos preparado para ti.
              </p>

              <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <button
                  type="button"
                  onClick={() => navigate('landing')}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-[#0a0805] transition-all hover:scale-105 active:scale-95"
                  style={{ background: GOLD, letterSpacing: '0.06em', animation: 'pulse-glow 2.5s ease-in-out infinite' }}
                >
                  <Disc3 size={18} /> Gira y gana tu bono
                </button>
                <button
                  type="button"
                  onClick={() => irA('sedes')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D4AF37]/40 px-8 py-4 text-base font-semibold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10"
                >
                  <MapPin size={18} /> Nuestras sedes
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:max-w-lg lg:max-w-none">
                {[
                  { icon: MapPin, valor: `${VENUES.length}`, label: 'sedes en Cúcuta' },
                  { icon: Gift, valor: '3', label: 'bonos de bienvenida' },
                  { icon: ShieldCheck, valor: '+18', label: 'juego responsable' },
                ].map(({ icon: Icon, valor, label }) => (
                  <div key={label} className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04] px-3 py-3 text-center lg:text-left">
                    <Icon size={16} className="mx-auto mb-1 text-[#D4AF37] lg:mx-0" />
                    <p className="font-display text-2xl leading-none font-black text-[#F5E6C8]">{valor}</p>
                    <p className="mt-1 text-[11px] text-[#9A7B50]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fichardo celebrando, sobre una ficha dorada que gira despacio. */}
            <div className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center sm:max-w-[380px] lg:max-w-[460px]">
              <div
                aria-hidden="true"
                className="absolute inset-[8%] animate-[spin_40s_linear_infinite] rounded-full border-2 border-dashed border-[#D4AF37]/25 motion-reduce:animate-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-[16%] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(240,200,71,0.28), rgba(181,32,32,0.12) 55%, transparent 72%)' }}
              />
              <img
                src={fichardoCelebrando}
                alt="Fichardo, la mascota de Gran Casino Cúcuta"
                decoding="async"
                className="fichardo-flota relative w-[88%] select-none drop-shadow-[0_24px_40px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>
        </section>

        <MarqueeBanner />
        <Carousel slides={CAROUSEL_SLIDES} />
        <MarqueeBanner />

        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          {/* ================= ACCESOS RÁPIDOS ================= */}
          <section className="py-16 sm:py-20">
            <SectionHeading eyebrow="ACCESOS RÁPIDOS" title="Explora" highlight="Gran Casino" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 sm:gap-5">
              {ACCESOS.map(({ label, desc, image, icon: Icon, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => action(navigate)}
                  className="group relative h-36 overflow-hidden rounded-2xl border border-[#D4AF37]/20 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 sm:h-44"
                  style={{ boxShadow: '0 16px 34px rgba(0,0,0,0.45)' }}
                >
                  <img
                    decoding="async"
                    loading="lazy"
                    src={image}
                    alt=""
                    className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px] transition-all duration-500 group-hover:scale-115 group-hover:blur-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0805] via-[#0a0805]/70 to-[#0a0805]/20" />
                  <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full p-[2px] sm:h-12 sm:w-12" style={{ background: GOLD }}>
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#121009]">
                        <Icon size={18} className="text-[#F0C847]" />
                      </span>
                    </span>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="font-display text-lg leading-tight font-bold text-[#F5E6C8] sm:text-2xl">{label}</p>
                        <p className="mt-0.5 text-xs text-[#C4A97A] sm:text-sm">{desc}</p>
                      </div>
                      <ArrowRight size={18} className="mb-1 hidden flex-shrink-0 text-[#D4AF37] transition-transform group-hover:translate-x-1 sm:block" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ================= PROMOCIÓN ================= */}
          <section className="pb-16 sm:pb-20">
            <div
              className="relative overflow-hidden rounded-[26px] border border-[#D4AF37]/35 p-2"
              style={{
                backgroundColor: '#15120B',
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 7px), radial-gradient(60% 90% at 100% 50%, rgba(212,175,55,0.18), transparent 70%), radial-gradient(50% 80% at 0% 0%, rgba(139,26,26,0.25), transparent 70%)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(181,32,32,0.25)',
              }}
            >
              <div className="grid items-center gap-6 rounded-[20px] border border-dashed border-[#D4AF37]/20 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] lg:p-10">
                <div className="text-center md:text-left">
                  <p className="mb-2 text-xs font-bold tracking-[0.25em] text-[#D4AF37]">PROMOCIÓN DE BIENVENIDA</p>
                  <h2 className="font-display mb-3 text-3xl leading-tight font-black text-[#F5E6C8] md:text-5xl">
                    Gira la tragamonedas y gana{' '}
                    <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>tu bono</span>
                  </h2>
                  <p className="mb-5 max-w-xl text-sm leading-relaxed text-[#C4A97A] md:text-base">
                    Es gratis y tienes 5 giros. Regístrate, reclama tu bono y redímelo en caja en cualquiera de nuestras sedes.
                  </p>
                  <div className="mb-6 flex justify-center md:justify-start">
                    <PremiosResumen variante="mini" />
                  </div>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                    <button
                      type="button"
                      onClick={() => navigate('roulette')}
                      className="rounded-full px-8 py-3.5 text-sm font-extrabold tracking-[0.06em] text-[#1a1408] transition-transform hover:scale-105"
                      style={{ background: GOLD }}
                    >
                      ✦ JUGAR AHORA ✦
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('prizes')}
                      className="rounded-full border border-[#D4AF37]/35 px-8 py-3.5 text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    >
                      Ver premios
                    </button>
                  </div>
                </div>
                <img
                  src={fichardoBono}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="fichardo-flota mx-auto w-52 select-none drop-shadow-[0_20px_34px_rgba(0,0,0,0.6)] md:w-64 lg:w-72"
                />
              </div>
            </div>
          </section>

          {/* ================= SEDES ================= */}
          <section id="sedes" className="scroll-mt-28 py-16 sm:py-20">
            <SectionHeading
              eyebrow={`${VENUES.length} SEDES EN CÚCUTA`}
              title="Nuestras"
              highlight="Sedes"
              desc="Encuentra el casino más cercano, revisa sus horarios y llega con un toque."
            />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
              <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/30 p-1.5" style={{ background: '#15120B', boxShadow: '0 24px 50px rgba(0,0,0,0.5)' }}>
                <LocationsMap height={520} />
              </div>
              {/* Una tarjeta por sede, en el mismo orden que los marcadores. */}
              <div className="flex flex-col gap-4">
                {VENUES.map((venue, i) => (
                  <article
                    key={venue.clave}
                    className="group flex overflow-hidden rounded-2xl border border-[#D4AF37]/20 transition-all hover:border-[#D4AF37]/55"
                    style={{ background: 'linear-gradient(145deg, #1C1810, #121009)', boxShadow: '0 14px 30px rgba(0,0,0,0.4)' }}
                  >
                    <div className="relative w-28 flex-shrink-0 overflow-hidden sm:w-36">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={FOTO_SEDE[i % FOTO_SEDE.length]}
                        alt={venue.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="font-display absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-[#1a1408]" style={{ background: GOLD }}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 p-4 sm:p-5">
                      <h3 className="font-display text-lg leading-tight font-bold text-[#F5E6C8]">{venue.name.replace('Gran Casino Cúcuta ', '')}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#C4A97A]">
                        <MapPin size={13} className="flex-shrink-0 text-[#D4AF37]" /> {venue.address}
                      </p>
                      <ul className="mt-3 space-y-1">
                        {venue.schedule.map((line) => (
                          <li key={line.days} className="flex gap-2 text-xs text-[#9A7B50]">
                            <Clock size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]/80" />
                            <span>
                              <span className="font-semibold text-[#E0CDB0]">{line.days}:</span> {line.hours}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={comoLlegarUrl(venue)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 px-3.5 py-1.5 text-xs font-bold text-[#F0C847] transition-colors hover:bg-[#D4AF37]/15"
                      >
                        <Navigation size={12} /> Cómo llegar
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ================= GALERÍA ================= */}
          <section className="py-16 sm:py-20">
            <SectionHeading eyebrow="CONOCE NUESTROS ESPACIOS" title="Galería de" highlight="Casinos" />
            {/* Mosaico: la primera foto ocupa dos filas en escritorio. */}
            <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4 sm:gap-4">
              {GALERIA.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFoto(src)}
                  aria-label="Ampliar foto"
                  className={`group relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 transition-colors hover:border-[#D4AF37]/60 ${
                    // 4 columnas: grande (2x2) + 2 sueltas + 3 anchas = 12
                    // celdas exactas, sin huecos. En celular (2 columnas) la
                    // última va a todo el ancho por el mismo motivo.
                    i === 0 ? 'col-span-2 row-span-2' : i === 5 ? 'col-span-2' : i >= 3 ? 'md:col-span-2' : ''
                  }`}
                >
                  <img loading="lazy" decoding="async" src={src} alt="Sala de Gran Casino Cúcuta" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
                  <span className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#0a0805]/70 text-[#F0C847] opacity-0 transition-opacity group-hover:opacity-100">
                    <Expand size={15} />
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#6B5D3F]">
              <Camera size={13} /> Fotografías de referencia de nuestras salas.
            </p>
          </section>

          {/* ================= VIDEOS ================= */}
          <section className="py-16 sm:py-20">
            <SectionHeading eyebrow="CONÓCENOS POR DENTRO" title="Nuestras Sedes en" highlight="Video" />
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VENUE_VIDEOS.map((v) => (
                <figure
                  key={v.title}
                  className="mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border border-[#D4AF37]/25 p-1.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/55"
                  style={{ background: 'linear-gradient(160deg, #1C1810, #121009)', boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
                >
                  {/* `#t=1`: la vista previa muestra el segundo 1 y no el
                      primer cuadro, que en algunos videos es negro. */}
                  <video src={`${v.src}#t=1`} controls muted playsInline preload="metadata" className="block h-auto w-full rounded-xl bg-black" />
                  <figcaption className="flex items-center gap-3 px-3 py-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: GOLD }}>
                      <Play size={14} className="ml-0.5 text-[#1a1408]" fill="#1a1408" />
                    </span>
                    <span>
                      <span className="font-display block text-base leading-tight font-bold text-[#F5E6C8]">{v.title}</span>
                      <span className="text-[11px] text-[#9A7B50]">{v.sub}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* ================= JUEGOS ================= */}
          <section className="py-16 sm:py-20">
            <SectionHeading eyebrow="DIVERSIÓN GARANTIZADA" title="Nuestros" highlight="Juegos" desc="Todo lo que encuentras en las salas de Gran Casino Cúcuta." />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {JUEGOS.map(({ title, desc, image, icon: Icon, page }) => (
                <article
                  key={title}
                  onClick={() => page && navigate(page)}
                  className={`group relative h-80 overflow-hidden rounded-2xl border border-[#D4AF37]/20 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 ${page ? 'cursor-pointer' : ''}`}
                  style={{ boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
                >
                  <img loading="lazy" decoding="async" src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0805] via-[#0a0805]/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full p-[2px]" style={{ background: GOLD }}>
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#121009]">
                        <Icon size={18} className="text-[#F0C847]" />
                      </span>
                    </span>
                    <h3 className="font-display text-2xl font-bold text-[#F5E6C8]">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#C4A97A]">{desc}</p>
                    <span
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                        page ? 'text-[#1a1408]' : 'border border-[#D4AF37]/35 text-[#D4AF37]'
                      }`}
                      style={page ? { background: GOLD } : undefined}
                    >
                      {page ? (
                        <>
                          Jugar en línea <ArrowRight size={12} />
                        </>
                      ) : (
                        <>
                          <MapPin size={11} /> Disponible en sede
                        </>
                      )}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ================= CLIENTE FRECUENTE ================= */}
          <section className="py-16 sm:py-20">
            <CuponesShowcase />
          </section>

          {/* ================= EVENTOS ================= */}
          <section id="eventos" className="scroll-mt-28 py-16 sm:py-20">
            <SectionHeading eyebrow="AGENDA" title="Eventos" highlight="Próximos" />
            {/* La agenda no tiene ningún evento con fecha confirmada. Cuando
                vuelva a haber uno, este bloque es lo que se reemplaza. */}
            <Panel tono="oro" className="mx-auto max-w-4xl">
              <div className="grid items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
                <img
                  src={fichardoProximamente}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="fichardo-flota mx-auto w-44 select-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)] md:w-52"
                />
                <div className="text-center md:text-left">
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#B52020]/50 bg-[#B52020]/10 px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-[#F5E6C8]">
                    <BellRing size={12} className="text-[#F0C847]" /> PRÓXIMAMENTE
                  </span>
                  <h3 className="font-display mb-2 text-3xl font-black text-[#F5E6C8]">Algo grande se viene</h3>
                  <p className="mb-5 text-sm leading-relaxed text-[#C4A97A] md:text-base">
                    Estamos preparando torneos, noches temáticas y jornadas de bingo en nuestras sedes. Muy pronto
                    encontrarás aquí la agenda con fechas y detalles.
                  </p>
                  <a
                    href="https://www.instagram.com/grancasinocucuta/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 px-5 py-2.5 text-sm font-bold text-[#F0C847] transition-colors hover:bg-[#D4AF37]/10"
                  >
                    <FaInstagram /> Entérate primero en Instagram
                  </a>
                </div>
              </div>
            </Panel>
          </section>
        </div>
      </div>

      {foto && <VisorFoto src={foto} onClose={() => setFoto(null)} />}

      <Footer navigate={navigate} />
    </div>
  )
}

function VisorFoto({ src, onClose }: { src: string; onClose: () => void }) {
  useBloquearScroll(true)
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="relative max-h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()} style={{ animation: 'modal-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#121009] text-[#F0C847]"
        >
          <X size={18} />
        </button>
        <img src={src} alt="Sala de Gran Casino Cúcuta" className="max-h-[85vh] w-full rounded-2xl border border-[#D4AF37]/40 object-contain" />
      </div>
    </div>
  )
}
