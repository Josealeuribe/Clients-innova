import { Club, Diamond, Heart, Spade } from 'lucide-react'
// RULETA 3D DESACTIVADA EN GIRA Y GANA (noviembre de 2026)
//
// La portada ahora muestra la tragamonedas 3D (SlotMachine3D). La ruleta NO se
// borró: su código completo sigue en features/roulette/components/Roulette3D.tsx
// y lo sigue usando la página /ruleta. Para volver a mostrarla aquí basta con
// descomentar este import y el bloque <Roulette3D /> de abajo, y quitar
// <SlotMachine3D />.
// import Roulette3D from '../../roulette/components/Roulette3D'
import SlotMachine3D from './SlotMachine3D'
import { getSuitStyle } from '../utils/landingVisuals'
// Recorte al contorno de fichado-señalando.png: sin el margen transparente del
// original, el ancho del <img> es el ancho real de Fichardo.
import fichardoSenalando from '@/shared/assets/images/fichardo-senalando-recorte.webp'

const SUITS = [Spade, Heart, Diamond, Club]

export default function WheelPreview3D() {
  return (
    <div
      className="
        relative
        left-1/2
        -translate-x-1/2

        w-[calc(100%+2rem)]
        max-w-none
        min-w-0
        h-[370px]

        sm:w-full
        sm:max-w-[560px]
        sm:h-[460px]

        md:max-w-[680px]
        md:h-[520px]

        lg:max-w-[780px]
        lg:h-[600px]

        xl:max-w-[860px]
        xl:h-[660px]
      "
    >
      {/* Ruleta 3D — desactivada, ver el comentario del import.
      <Roulette3D
        preview
        quality="medium"
        className="h-full w-full"
      />
      */}

      {/* Tragamonedas 3D (solo diseño: la palanca y los rodillos son
          decorativos, no sortean premios). */}
      <SlotMachine3D className="h-full w-full" />

      {/* Fichardo grande en el borde inferior derecho, con vaivén */}
      <img
        src={fichardoSenalando}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="
          pointer-events-none
          select-none
          absolute
          z-20
          h-auto
          object-contain
          fichardo-flota

          w-[30%]
          max-w-[120px]
          right-[1%]
          bottom-[2%]

          sm:max-w-[160px]

          md:max-w-[190px]

          lg:max-w-[220px]
          lg:right-[1%]

          xl:max-w-[250px]

          drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]
        "
      />

      {/* Símbolos decorativos */}
      {SUITS.map((Suit, index) => (
        <div
          key={index}
          className="pointer-events-none absolute"
          style={getSuitStyle(index)}
        >
          <Suit size={20} fill="currentColor" />
        </div>
      ))}
    </div>
  )
}