import { FileText, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { Page } from '@/shared/types/navigation'
import FormCheckbox from '../components/FormCheckbox'

interface Props {
  navigate: (page: Page) => void
  hrefFor: (page: Page) => string

  terminos: boolean
  setTerminos: (value: boolean) => void
  datos: boolean
  setDatos: (value: boolean) => void
  edad: boolean
  setEdad: (value: boolean) => void
  promo: boolean
  setPromo: (value: boolean) => void
  comms: boolean
  setComms: (value: boolean) => void

  allConfirmed: boolean
  attemptedNext: boolean
  step4Valid: boolean
}

export default function ConfirmationsSection(props: Props) {
  const toggleAllConfirmations = (checked: boolean) => {
    props.setTerminos(checked)
    props.setDatos(checked)
    props.setEdad(checked)
    props.setPromo(checked)
    props.setComms(checked)
  }

  return (
    <div className="flex flex-col gap-4">
      <FormCheckbox
        label="Acepto los términos y condiciones de Gran Casino Cucuta."
        checked={props.terminos}
        onChange={props.setTerminos}
        required
      />

      <FormCheckbox
        label="Autorizo el tratamiento de mis datos personales conforme a la política de privacidad."
        checked={props.datos}
        onChange={props.setDatos}
        required
      />

      <FormCheckbox
        label="Confirmo que soy mayor de 18 años."
        checked={props.edad}
        onChange={props.setEdad}
        required
      />

      <FormCheckbox
        label="Acepto las condiciones de la promoción vigente."
        checked={props.promo}
        onChange={props.setPromo}
        required
      />

      <div className="h-px bg-[#D4AF37]/15 my-1" />

      <FormCheckbox
        label="Acepto recibir comunicaciones promocionales de Gran Casino Cucuta. (Opcional)"
        checked={props.comms}
        onChange={props.setComms}
      />

      <div className="h-px bg-[#D4AF37]/15 my-1" />

      <FormCheckbox
        label="Seleccionar todo"
        checked={props.allConfirmed}
        onChange={toggleAllConfirmations}
      />

      {props.attemptedNext && !props.step4Valid && (
        <span className="text-red-400 text-xs flex items-center gap-1">
          <TriangleAlert size={12} className="flex-shrink-0" />
          Debes aceptar todas las condiciones obligatorias para continuar.
        </span>
      )}

      <div className="mt-2 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 px-4 py-3">
        <p className="text-xs text-[#9A7B50] mb-2">
          Antes de aceptar, puedes consultar:
        </p>

        <div className="flex flex-col gap-1.5">
          <a
            href={props.hrefFor('terms')}
            onClick={(event) => {
              event.preventDefault()
              props.navigate('terms')
            }}
            className="text-xs text-[#D4AF37] hover:text-[#F0C847] underline inline-flex items-center gap-1.5 w-fit"
          >
            <FileText size={13} className="flex-shrink-0" />
            Términos y condiciones
          </a>

          <a
            href={props.hrefFor('privacy')}
            onClick={(event) => {
              event.preventDefault()
              props.navigate('privacy')
            }}
            className="text-xs text-[#D4AF37] hover:text-[#F0C847] underline inline-flex items-center gap-1.5 w-fit"
          >
            <ShieldCheck size={13} className="flex-shrink-0" />
            Política de privacidad
          </a>
        </div>

        <p className="text-[10px] text-[#6B5D3F] mt-2">
          Al volver retomarás el registro donde lo dejaste.
        </p>
      </div>
    </div>
  )
}
