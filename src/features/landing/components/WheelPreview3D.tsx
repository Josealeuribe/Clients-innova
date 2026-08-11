import { Club, Diamond, Heart, Spade } from 'lucide-react'
import Roulette3D from '../../roulette/components/Roulette3D'
import { getSuitStyle } from '../utils/landingVisuals'

const SUITS = [Spade, Heart, Diamond, Club]

export default function WheelPreview3D() {
  return (
    <div className="relative h-[300px] w-[min(88vw,520px)] sm:h-[360px] lg:h-[420px]">
      <Roulette3D
        preview
        quality="medium"
        className="h-full w-full"
      />

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
