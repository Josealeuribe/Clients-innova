import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import Footer from '@/shared/components/Footer'
import BackButton from '@/shared/components/BackButton'
import { FAQ_ITEMS } from '@/shared/data/faq'

interface Props {
  navigate: (page: Page) => void
}

export default function FaqPage({ navigate }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">RESOLVEMOS TUS DUDAS</p>
        <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8] mb-8">Preguntas Frecuentes</h1>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.question}
                className="rounded-2xl border border-[#D4AF37]/15 overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="font-semibold text-[#F5E6C8]">{item.question}</span>
                  <span
                    className="text-[#D4AF37] text-xl flex-shrink-0 transition-transform"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#9A7B50] leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-[#3A3020] text-xs mt-10">
          ¿Tu pregunta no está aquí?{' '}
          <button
            onClick={() => navigate('login')}
            className="text-[#9A7B50] hover:text-[#D4AF37] transition-colors underline"
          >
            Contáctanos desde tu cuenta
          </button>
        </p>
      </div>

      <div className="mt-auto -mx-4 sm:-mx-6 lg:-mx-8 pt-20">
        <Footer navigate={navigate} />
      </div>
    </div>
  )
}
