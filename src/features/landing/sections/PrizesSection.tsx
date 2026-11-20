import { useVigencias } from '@/shared/hooks/useVigencias'
import CuponesCard from '../components/CuponesCard'
import PrizeTicket from '../components/PrizeTicket'
import SectionHeader from '../components/SectionHeader'
import { LandingPrize } from '../services/landing.service'

// El premio mayor va abajo, centrado y resaltado.
const CLAVE_MAYOR = 'bono-50000'

interface Props {
  prizes: readonly LandingPrize[]
  getMarketingTag: (clave: string) => string | undefined
  onRoulette: () => void
}

export default function PrizesSection({ prizes, getMarketingTag, onRoulette }: Props) {
  // La fecha de cada boleto sale de la base: extender la promoción la cambia
  // aquí sin desplegar el frontend.
  const { datos: vigencias } = useVigencias()

  const vigenciaDe = (clave: string) => vigencias?.vigencias.find((v) => v.clave === clave) ?? null
  const mayor = prizes.find((prize) => prize.clave === CLAVE_MAYOR)

  const irAComoFunciona = () => {
    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="premios" className="relative py-24">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="BENEFICIOS EXCLUSIVOS"
          title="Premios Disponibles"
        />

        {/* Dos boletos arriba (izquierda y derecha) y abajo el premio mayor,
            con la tarjeta de cupones a su izquierda. El mayor se separa por
            clave, no por su posición en PRIZES: si el catálogo cambia de
            orden, sigue quedando abajo. */}
        <div className="grid gap-x-10 gap-y-14 lg:grid-cols-2">
          {prizes
            .filter((prize) => prize.clave !== CLAVE_MAYOR)
            .map((prize) => (
              <PrizeTicket
                key={prize.clave}
                prize={prize}
                tag={getMarketingTag(prize.clave)}
                vigencia={vigenciaDe(prize.clave)}
                onRoulette={onRoulette}
                onComoFunciona={irAComoFunciona}
              />
            ))}
        </div>

        {mayor && (
          <div className="mt-16 flex flex-col items-stretch justify-center gap-10 lg:flex-row lg:items-center lg:gap-8">
            {/* En celular va después del boleto: primero el premio, luego la
                invitación a volver. */}
            <div className="order-last lg:order-none lg:w-[300px] lg:flex-none xl:w-[320px]">
              <CuponesCard />
            </div>
            <div className="lg:w-[calc(50%-1.25rem)]">
              <PrizeTicket
                prize={mayor}
                tag={getMarketingTag(mayor.clave)}
                vigencia={vigenciaDe(mayor.clave)}
                destacado
                onRoulette={onRoulette}
                onComoFunciona={irAComoFunciona}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
