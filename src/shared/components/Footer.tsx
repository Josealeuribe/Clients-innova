import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/logo.png'
import coljuegosImg from '@/shared/assets/images/coljuegos-seeklogo.png'

interface Props {
  navigate: (page: Page) => void
}

export default function Footer({ navigate }: Props) {
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
                  alt="Innova Club SAS"
                  className="max-h-12 max-w-[100px] w-auto object-contain"
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
                  src={coljuegosImg}
                  alt="Coljuegos"
                  className="max-h-8 max-w-[115px] w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-[#8D7A55] text-sm leading-relaxed max-w-sm">
              Entretenimiento premium y beneficios exclusivos para nuestros
              socios. Diversión responsable.
            </p>

            <div className="flex gap-3 mt-5">
              {['f', 'in', 'ig'].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={`Red social ${social}`}
                  className="
                w-9 h-9
                rounded-full
                border border-[#D4AF37]/25
                flex items-center justify-center
                text-[#C4A97A]
                text-xs font-bold
                transition-all duration-300
                hover:border-[#D4AF37]/60
                hover:text-[#D4AF37]
                hover:bg-[#D4AF37]/5
                hover:-translate-y-0.5
              "
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4
              className="text-[#D4AF37] text-xs font-bold tracking-widest mb-4"
              style={{ fontFamily: "'Sreda', serif" }}
            >
              NAVEGACIÓN
            </h4>

            {[
              'Inicio',
              'Premios',
              'Cómo Funciona',
              'Preguntas Frecuentes',
              'Iniciar Sesión',
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="
              block
              text-[#8D7A55]
              text-sm
              mb-2.5
              transition-colors
              hover:text-[#D4AF37]
            "
              >
                {link}
              </a>
            ))}
          </div>

          <div>
            <h4
              className="text-[#D4AF37] text-xs font-bold tracking-widest mb-4"
              style={{ fontFamily: "'Sreda', serif" }}
            >
              LEGAL
            </h4>

            <button
              onClick={() => navigate('terms')}
              className="block text-[#8D7A55] text-sm mb-2.5 transition-colors hover:text-[#D4AF37] text-left"
            >
              Términos y Condiciones
            </button>

            {[
              'Política de Privacidad',
              'Tratamiento de Datos',
              'Juego Responsable',
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="
              block
              text-[#8D7A55]
              text-sm
              mb-2.5
              transition-colors
              hover:text-[#D4AF37]
            "
              >
                {link}
              </a>
            ))}

            <button
              onClick={() => navigate('terms')}
              className="block text-[#8D7A55] text-sm mb-2.5 transition-colors hover:text-[#D4AF37] text-left"
            >
              Condiciones Promoción
            </button>
          </div>
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
            © 2026 Innova Club SAS. Todos los derechos reservados.
          </p>

          <p className="text-[#665A43] text-xs text-center">
            🔞 Solo para mayores de 18 años · Juega con responsabilidad · Línea de
            ayuda: 01-8000-111-444
          </p>
        </div>
      </div>
    </footer>
  )
}
