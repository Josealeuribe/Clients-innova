import type { Page } from '@/shared/types/navigation'
import { ShieldAlert } from 'lucide-react'
import { useNavigation } from '@/shared/context/NavigationContext'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import logoImg2 from '@/shared/assets/images/logo.png'
import coljuegosImg from '@/shared/assets/images/coljuegos-seeklogo.png'
import vigiladoSupersaludImg from '@/shared/assets/images/logo-vigilado-supersalud.png'
import edad18Img from '@/shared/assets/images/+18.png'
import bandaCondicionesImg from '@/shared/assets/images/banda-condiciones.png'
import LocationsMap from '@/shared/components/LocationsMap'
import juegoResponsable from '@/shared/assets/images/juego-responsable.jpg'
import autorizaColjuegos from '@/shared/assets/images/Autoriza-coljuegos.webp'
import { FaFacebookF, FaInstagram } from 'react-icons/fa'


interface Props {
  navigate: (page: Page) => void
}

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: 'Inicio', page: 'home' },
  { label: 'Gira y Gana', page: 'landing' },
  { label: 'Premios', page: 'prizes' },
  { label: 'Cómo Funciona', page: 'how-it-works' },
  { label: 'Preguntas Frecuentes', page: 'faq' },
  { label: 'Iniciar Sesión', page: 'login' },
]

export default function Footer({ navigate }: Props) {
  const { page } = useNavigation()

  return (
    <footer
      className="w-full border-t border-[#D4AF37]/20 py-14 backdrop-blur-md"
      style={{ background: 'rgba(5, 4, 2, 0.55)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            {/* Logos */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div
                className="
              w-36 h-16
              flex items-center justify-center
              rounded-xl
              border border-[#D4AF37]/15
              bg-black/20
              backdrop-blur-sm
              px-4 py-2
              transition-all duration-300
              hover:border-[#D4AF37]/35
              hover:bg-black/30
            "
              >
                <img
                  src={logoImg}
                  alt="Gran Casino Cucuta"
                  className="max-h-12 max-w-[100px] w-auto object-contain"
                />
              </div>

              {/* <div
                className="
              w-36 h-16
              flex items-center justify-center
              rounded-xl
              border border-[#D4AF37]/15
              bg-black/20
              backdrop-blur-sm
              px-4 py-2
              transition-all duration-300
              hover:border-[#D4AF37]/35
              hover:bg-black/30
            "
              >
                <img
                  src={logoImg2}
                  alt="Gran Casino Cucuta"
                  className="max-h-12 max-w-[100px] w-auto object-contain"
                />
              </div> */}

              <div
                className="
              w-36 h-16
              flex items-center justify-center
              rounded-xl
              border border-[#D4AF37]/15
              bg-black/20
              backdrop-blur-sm
              px-4 py-2
              transition-all duration-300
              hover:border-[#D4AF37]/35
              hover:bg-black/30
            "
              >
                <img
                  src={coljuegosImg}
                  alt="Coljuegos"
                  className="max-h-8 max-w-[115px] w-auto object-contain"
                />
              </div>

              <div
                className="
              w-36 h-16
              flex items-center justify-center
              rounded-xl
              border border-[#D4AF37]/15
              bg-black/20
              backdrop-blur-sm
              px-4 py-2
              transition-all duration-300
              hover:border-[#D4AF37]/35
              hover:bg-black/30
            "
              >
                <img
                  src={vigiladoSupersaludImg}
                  alt="Vigilado Supersalud"
                  className="max-h-8 max-w-[115px] w-auto object-contain"
                />
              </div>



            </div>

            <p className="text-[#8D7A55] text-sm leading-relaxed max-w-sm">
              Entretenimiento premium y beneficios exclusivos para nuestros
              socios. Diversión responsable.
            </p>

<div className="flex items-center gap-3 mt-5">
  <a
    href="https://www.facebook.com/share/17tby12Rnk/?mibextid=wwXIfr"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Visitar Facebook de Gran Casino"
    className="
      group
      w-10 h-10
      rounded-full
      border border-[#D4AF37]/25
      flex items-center justify-center
      text-[#C4A97A]
      transition-all duration-300
      hover:-translate-y-0.5
      hover:border-[#1877F2]/70
      hover:bg-[#1877F2]/10
      hover:text-[#1877F2]
      hover:shadow-[0_8px_20px_rgba(24,119,242,0.18)]
    "
  >
    <FaFacebookF className="text-lg" />
  </a>

  <a
    href="https://www.instagram.com/grancasinocucuta/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Visitar Instagram de Gran Casino"
    className="
      group
      w-10 h-10
      rounded-full
      border border-[#D4AF37]/25
      flex items-center justify-center
      text-[#C4A97A]
      transition-all duration-300
      hover:-translate-y-0.5
      hover:border-[#E1306C]/70
      hover:bg-[#E1306C]/10
      hover:text-[#E1306C]
      hover:shadow-[0_8px_20px_rgba(225,48,108,0.18)]
    "
  >
    <FaInstagram className="text-xl" />
  </a>
</div>
          </div>

          <div>
            <h4
              className="text-[#D4AF37] text-xs font-bold tracking-widest mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              NAVEGACIÓN
            </h4>

            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.page)}
                className={`block text-left text-sm mb-2.5 transition-colors ${
                  page === link.page ? 'text-[#D4AF37] font-semibold' : 'text-[#8D7A55] hover:text-[#D4AF37]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div>
            <h4
              className="text-[#D4AF37] text-xs font-bold tracking-widest mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              LEGAL
            </h4>

            <button
              onClick={() => navigate('terms')}
              className={`block text-sm mb-2.5 transition-colors text-left ${page === 'terms' ? 'text-[#D4AF37] font-semibold' : 'text-[#8D7A55] hover:text-[#D4AF37]'}`}
            >
              Términos y Condiciones
            </button>

            <button
              onClick={() => navigate('privacy')}
              className={`block text-sm mb-2.5 transition-colors text-left ${page === 'privacy' ? 'text-[#D4AF37] font-semibold' : 'text-[#8D7A55] hover:text-[#D4AF37]'}`}
            >
              Política de Privacidad
            </button>

            <button
              onClick={() => navigate('privacy')}
              className={`block text-sm mb-2.5 transition-colors text-left ${page === 'privacy' ? 'text-[#D4AF37] font-semibold' : 'text-[#8D7A55] hover:text-[#D4AF37]'}`}
            >
              Tratamiento de Datos
            </button>

            <button
              onClick={() => navigate('responsible-gaming')}
              className={`block text-sm mb-2.5 transition-colors text-left ${page === 'responsible-gaming' ? 'text-[#D4AF37] font-semibold' : 'text-[#8D7A55] hover:text-[#D4AF37]'}`}
            >
              Juego Responsable
            </button>

            <button
              onClick={() => navigate('terms')}
              className={`block text-sm mb-2.5 transition-colors text-left ${page === 'terms' ? 'text-[#D4AF37] font-semibold' : 'text-[#8D7A55] hover:text-[#D4AF37]'}`}
            >
              Condiciones Promoción
            </button>

            <div
              className="
              w-16 h-16
              flex items-center justify-center
              rounded-xl
              border border-[#D4AF37]/15
              bg-black/20
              backdrop-blur-sm
              transition-all duration-300
              hover:border-[#D4AF37]/35
              hover:bg-black/30
            "
            >
              <img
                src={edad18Img}
                alt="Solo para mayores de 18 años"
                className="max-h-10 max-w-[40px] w-auto object-contain"
              />

            </div>
            
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
  {/* Juego Responsable */}
  <div
    className="
      group
      relative
      flex
      h-20
      min-w-0
      items-center
      justify-center
      overflow-hidden
      rounded-xl
      border
      border-[#D4AF37]/25
      bg-white
      p-1.5
      shadow-[0_8px_22px_rgba(0,0,0,0.35)]
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:border-[#D4AF37]/60
      hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]
    "
  >
    <img
      src={juegoResponsable}
      alt="Juego Responsable"
      className="
        h-full
        w-full
        object-contain
        transition-transform
        duration-300
        group-hover:scale-105
      "
    />
  </div>

  {/* Autoriza Coljuegos */}
  <div
    className="
      group
      relative
      flex
      h-20
      min-w-0
      items-center
      justify-center
      overflow-hidden
      rounded-xl
      border
      border-[#D4AF37]/25
      bg-white
      p-1.5
      shadow-[0_8px_22px_rgba(0,0,0,0.35)]
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:border-[#D4AF37]/60
      hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]
    "
  >
    <img
      src={autorizaColjuegos}
      alt="Autoriza Coljuegos"
      className="
        h-full
        w-full
        object-contain
        transition-transform
        duration-300
        group-hover:scale-105
      "
    />
  </div>
</div>

        </div>

        <div className="mt-2 mb-10 pt-8 border-t border-[#D4AF37]/10">
          <h4
            className="text-[#D4AF37] text-xs font-bold tracking-widest mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            UBICACIÓN
          </h4>
          <p className="text-[#8D7A55] text-sm mb-4 max-w-lg">
            Encuéntranos en nuestras 3 sedes de Gran Casino Cúcuta.
          </p>
          <LocationsMap compact height={220} />
        </div>

        <div className="mb-10 rounded-xl overflow-hidden bg-white p-2">
          <img
            src={bandaCondicionesImg}
            alt="Condiciones promocionales y entidades reguladoras"
            className="w-full h-auto block"
          />
        </div>

        <div
          className="
        border-t border-[#D4AF37]/10
        pt-6
        flex flex-col md:flex-row
        justify-between items-center
        gap-3
      "
        >
          <p className="text-[#665A43] text-xs text-center md:text-left">
            © 2026 Gran Casino Cucuta. Todos los derechos reservados.
          </p>

          <p className="text-[#665A43] text-xs text-center flex items-center justify-center gap-1.5">
            <ShieldAlert size={13} className="flex-shrink-0" /> Solo para mayores de 18 años · Juega con
            responsabilidad · Línea de ayuda: 01-8000-111-444
          </p>
        </div>
      </div>
    </footer>
  )
}
