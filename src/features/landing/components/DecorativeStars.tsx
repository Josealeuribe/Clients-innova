import { getStarStyle } from "../utils/landingVisuals"


interface Props {
  count?: number
}

export default function DecorativeStars({ count = 18 }: Props) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-[#D4AF37]"
          style={getStarStyle(index)}
        />
      ))}
    </>
  )
}
