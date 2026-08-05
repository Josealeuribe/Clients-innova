import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CarouselSlide {
  title: string
  subtitle?: string
  image: string
  gradient: string
}

interface Props {
  slides: CarouselSlide[]
  autoplayMs?: number
}

export default function Carousel({ slides, autoplayMs = 4500 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const total = slides.length
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isPaused || total <= 1) return
    timerRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total)
    }, autoplayMs)
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [isPaused, total, autoplayMs])

  const goTo = (index: number) => setActiveIndex(((index % total) + total) % total)

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative w-full flex-shrink-0 h-[56vh] sm:h-[62vh] lg:h-[70vh] min-h-[380px] max-h-[760px]"
            style={{ background: slide.gradient }}
          >
            <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            <div className="relative h-full flex flex-col items-center justify-end text-center px-6 pb-16 sm:pb-20">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F5E6C8]">{slide.title}</h3>
              {slide.subtitle && (
                <p className="text-[#F5E6C8]/85 text-sm sm:text-base mt-2 max-w-md">{slide.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border border-[#D4AF37]/40 bg-black/30 text-[#D4AF37] hover:bg-black/50 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border border-[#D4AF37]/40 bg-black/30 text-[#D4AF37] hover:bg-black/50 transition-all"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ir a la diapositiva ${index + 1}`}
                onClick={() => goTo(index)}
                className="h-2 rounded-full transition-all"
                style={{
                  background: index === activeIndex ? '#D4AF37' : 'rgba(212,175,55,0.3)',
                  width: index === activeIndex ? 18 : 8,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
