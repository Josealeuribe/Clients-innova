import { useEffect } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import { useEstadoPersistido } from '@/shared/hooks/useEstadoPersistido'
import StaffSidebarLayout from '@/shared/components/StaffSidebarLayout'
import { CambioPasswordObligatorio, MiCuentaSection } from '@/shared/components/CambiarPassword'
import VigenciasStaffSection from '@/shared/components/VigenciasStaffSection'
import { VigenciaResumen } from '@/shared/components/VigenciaPromocion'
import { useVigencias } from '@/shared/hooks/useVigencias'
import { NAV_ITEMS } from './cajero.constants'
import type { CajeroSection } from './cajero.types'
import { useCajeroHistorial } from './hooks/useCajeroHistorial'
import { useCajeroOperaciones } from './hooks/useCajeroOperaciones'
import SedeActualBanner from './components/SedeActualBanner'
import CanjearCodigoSection from './sections/CanjearCodigoSection'
import HistorialSection from './sections/HistorialSection'
import BuscarDocumentoSection from './sections/BuscarDocumentoSection'


interface Props {
  navigate: (page: Page) => void
}

export default function CajeroPage({ navigate }: Props) {
  const { staff, token, loading: authLoading } = useAuth()
  // La sección sobrevive a recargar: en el mostrador, un F5 en mitad de un
  // turno no debe sacar a la cajera del historial y devolverla a "Canjear".
  const [section, setSection] = useEstadoPersistido<CajeroSection>('gcc_seccion:cajero', 'canjear')

  useEffect(() => {
    if (authLoading) return
    if (!staff || (staff.rol !== 'cajero' && staff.rol !== 'admin')) {
      navigate('landing')
    }
  }, [authLoading, staff, navigate])

  const canUsePanel = !authLoading && !!staff && (staff.rol === 'cajero' || staff.rol === 'admin')
  const historial = useCajeroHistorial(token, canUsePanel && section === 'historial')
  // La vigencia se consulta en todo el panel, no solo en su sección: mientras la
  // cajera está canjeando es cuando importa que tenga la fecha a la vista.
  const vigencias = useVigencias(canUsePanel)
  const operaciones = useCajeroOperaciones({
    token,
    onCanjeConfirmado: historial.invalidate,
  })

  return (
    <StaffSidebarLayout
      title={NAV_ITEMS.find((item) => item.id === section)?.label || 'Panel'}
      navItems={NAV_ITEMS}
      activeSection={section}
      onSectionChange={(id) => setSection(id as CajeroSection)}
    >
      {staff?.debeCambiarPassword && <CambioPasswordObligatorio />}

      {staff?.sede && section !== 'cuenta' && <SedeActualBanner sede={staff.sede} />}

      {/* La fecha vigente, visible mientras se canjea. El canje ya la valida por
          su lado (el backend rechaza un bono vencido), pero el mostrador
          necesita poder decirla ANTES de que el cliente pregunte. En la sección
          de Vigencias no se repite: allí está el detalle completo. */}
      {section !== 'cuenta' && section !== 'vigencias' && (
        <VigenciaResumen datos={vigencias.datos} error={vigencias.error} className="mb-5" />
      )}

      {section === 'canjear' && (
        <CanjearCodigoSection
          codigo={operaciones.codigo}
          setCodigo={operaciones.setCodigo}
          preview={operaciones.preview}
          error={operaciones.error}
          success={operaciones.success}
          searching={operaciones.searching}
          canjeando={operaciones.canjeando}
          sedeActual={staff?.sede}
          onBuscar={operaciones.buscarCodigo}
          onConfirmar={operaciones.confirmarCodigo}
        />
      )}

      {section === 'buscar' && (
        <BuscarDocumentoSection
          doc={operaciones.doc}
          setDoc={operaciones.setDoc}
          encontrado={operaciones.encontrado}
          error={operaciones.docError}
          success={operaciones.success}
          buscando={operaciones.buscandoDoc}
          canjeando={operaciones.canjeando}
          sedeActual={staff?.sede}
          onBuscar={operaciones.buscarDocumento}
          onConfirmar={operaciones.confirmarDocumento}
        />
      )}

      {section === 'historial' && (
        <HistorialSection
          historial={historial.historial}
          error={historial.error}
          soloPropios={historial.soloPropios}
        />
      )}

      {section === 'vigencias' && <VigenciasStaffSection />}

      {section === 'cuenta' && <MiCuentaSection />}
    </StaffSidebarLayout>
  )
}
