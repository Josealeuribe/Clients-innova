import { useEffect, useRef } from 'react';

const MARQUEE_MESSAGES: string[] = [
  'Gira la ruleta y descubre tu recompensa',
  'Atrévete a visitarnos',
  'Vive la emoción de Gran Casino',
  'Haz parte de nuestra comunidad',
];

export const MarqueeBanner = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstGroupRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef<boolean>(false);

  useEffect(() => {
    const track = trackRef.current;
    const firstGroup = firstGroupRef.current;

    if (!track || !firstGroup) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let position = 0;
    let previousTime = performance.now();

    // Velocidad de desplazamiento en píxeles por segundo
    const speed = 55;

    const animate = (currentTime: number): void => {
      const elapsedTime = (currentTime - previousTime) / 1000;
      previousTime = currentTime;

      if (!pausedRef.current) {
        position += speed * elapsedTime;

        const groupWidth = firstGroup.offsetWidth;

        if (position >= groupWidth) {
          position -= groupWidth;
        }

        track.style.transform = `translate3d(${-position}px, 0, 0)`;
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const renderMessages = () =>
    MARQUEE_MESSAGES.map((message) => (
      <div
        key={message}
        className="flex shrink-0 items-center gap-8 whitespace-nowrap"
      >
        <span
          className="
            text-xs
            font-bold
            uppercase
            tracking-[0.16em]
            text-[#F5E6C8]
            sm:text-sm
            md:text-base
          "
        >
          {message}
        </span>

        <span
          aria-hidden="true"
          className="
            text-lg
            text-[#D4AF37]
            drop-shadow-[0_0_8px_rgba(212,175,55,0.65)]
          "
        >
          ✦
        </span>
      </div>
    ));

  return (
    <section
      aria-label="Promociones de Gran Casino"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      className="
        relative
        w-full
        overflow-hidden
        border-y
        border-[#D4AF37]/40
        bg-[#120F08]/95
        py-3
        shadow-[0_0_28px_rgba(212,175,55,0.18)]
        backdrop-blur-md
        sm:py-4
      "
    >
      {/* Iluminación dorada */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-[#D4AF37]/10
          to-transparent
        "
      />

      {/* Línea superior */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#D4AF37]
          to-transparent
          opacity-80
        "
      />

      {/* Línea inferior */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#D4AF37]
          to-transparent
          opacity-50
        "
      />

      {/* Difuminado izquierdo */}
      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-10
          w-16
          bg-gradient-to-r
          from-[#120F08]
          via-[#120F08]/90
          to-transparent
          sm:w-28
        "
      />

      {/* Difuminado derecho */}
      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          z-10
          w-16
          bg-gradient-to-l
          from-[#120F08]
          via-[#120F08]/90
          to-transparent
          sm:w-28
        "
      />

      {/* Contenido en movimiento */}
      <div
        ref={trackRef}
        className="
          relative
          flex
          w-max
          items-center
          will-change-transform
        "
      >
        <div
          ref={firstGroupRef}
          className="
            flex
            shrink-0
            items-center
            gap-8
            pr-8
            sm:gap-12
            sm:pr-12
          "
        >
          {renderMessages()}
        </div>

        <div
          aria-hidden="true"
          className="
            flex
            shrink-0
            items-center
            gap-8
            pr-8
            sm:gap-12
            sm:pr-12
          "
        >
          {renderMessages()}
        </div>
      </div>
    </section>
  );
};