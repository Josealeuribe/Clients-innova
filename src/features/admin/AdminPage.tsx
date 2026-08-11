import { useEffect, useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import StaffSidebarLayout from '@/shared/components/StaffSidebarLayout'
import { CambioPasswordObligatorio, MiCuentaSection } from '@/shared/components/CambiarPassword'


import { NAV_ITEMS } from './admin.constants'
import { AdminSection } from './admin.types'
import AdminError from './components/AdminError'
import AdminLoading from './components/AdminLoading'
import { useAdminClientes } from './hooks/useAdminClientes'
import { useAdminCanjes } from './hooks/useAdminCanjes'
import { useAdminUsuarios } from './hooks/useAdminUsuarios'
import OverviewSection from './sections/OverviewSection'
import ClientesSection from './sections/ClientesSection'
import CanjesSection from './sections/CanjesSection'
import CampanasSection from './sections/CampanasSection'
import PersonalSection from './sections/PersonalSection'

interface Props {
  navigate: (page: Page) => void
}

export default function AdminPage({ navigate }: Props) {
  const { staff, token, loading: authLoading } = useAuth()
  const [section, setSection] = useState<AdminSection>('overview')

  useEffect(() => {
    if (authLoading) return
    if (!staff || staff.rol !== 'admin') navigate('landing')
  }, [authLoading, staff, navigate])

  const isAdmin = !authLoading && staff?.rol === 'admin'
  const { clientes, error: clientesError } = useAdminClientes(token, isAdmin)
  const { canjes, error: canjesError } = useAdminCanjes(token, isAdmin && section === 'canjes')
  const personal = useAdminUsuarios(token, isAdmin && section === 'personal')

  return (
    <StaffSidebarLayout
      title={NAV_ITEMS.find((item) => item.id === section)?.label || 'Panel'}
      navItems={NAV_ITEMS}
      activeSection={section}
      onSectionChange={(id) => setSection(id as AdminSection)}
    >
      {staff?.debeCambiarPassword && <CambioPasswordObligatorio />}

      {clientesError && <AdminError message={clientesError} centered />}

      {!clientes &&
        !clientesError &&
        section !== 'personal' &&
        section !== 'cuenta' &&
        section !== 'canjes' && (
          <AdminLoading />
        )}

      {section === 'overview' && clientes && <OverviewSection clientes={clientes} />}
      {section === 'clientes' && clientes && <ClientesSection clientes={clientes} />}
      {section === 'canjes' && <CanjesSection canjes={canjes} error={canjesError} />}
      {section === 'campanas' && <CampanasSection clientes={clientes} />}
      {section === 'personal' && (
        <PersonalSection
          usuarios={personal.usuarios}
          error={personal.error}
          temporal={personal.temporal}
          reseteando={personal.reseteando}
          onRestablecer={personal.restablecer}
          onClearTemporal={personal.clearTemporal}
        />
      )}
      {section === 'cuenta' && <MiCuentaSection />}
    </StaffSidebarLayout>
  )
}
