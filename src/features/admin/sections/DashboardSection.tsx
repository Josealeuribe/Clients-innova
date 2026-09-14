import { useMemo, useState, type ReactNode } from 'react'
import { CircleCheck, Clock, MapPinOff, Users, Wallet } from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import BarrasEntrega from '../charts/BarrasEntrega'
import BarrasPremio from '../charts/BarrasPremio'
import BarrasSede from '../charts/BarrasSede'
import LineasRitmo from '../charts/LineasRitmo'
import Medidor from '../charts/Medidor'
import TarjetaGrafica, { TablaGrafica } from '../charts/TarjetaGrafica'
import { TINTA } from '../charts/paleta'
import DineroCasinosModal from '../components/DineroCasinosModal'
import { formatCOPCorto, formatDemora, formatDiaCorto, formatNumero } from '../utils/adminFormatters'
import { buildDashboardStats } from '../utils/dashboardStats'
import { buildDineroPorCasino } from '../utils/dineroPorCasino'

// DASHBOARD DEL ADMINISTRADOR
//
// QUÉ HACE DISTINTO A "VISTA GENERAL"
//
// Vista General responde "cómo va la promoción hoy": los conteos del momento y
// las vigencias que están por vencer. Este dashboard responde el reparto y el
// ritmo: cuánto lleva cada casino, en qué se está yendo la promoción y cómo
// avanzó en el tiempo. Son dos preguntas distintas y por eso no se apilan en
// una sola pantalla que nadie termina de leer.
//
// TODAS LAS GRÁFICAS TIENEN VISTA DE TABLA
//
// No es un extra. Es la vía de lectura para quien no distingue los matices, para
// quien navega con lector de pantalla y para quien necesita copiar los números
// a un correo. El color nunca es el único canal.

interface Props {
  clientes: AdminClienteRow[] | null
}

export default function DashboardSection({ clientes }: Props) {
  const [modalDinero, setModalDinero] = useState(false)

  // Recorrer la lista de clientes cuatro veces por render sería gratis con los
  // números de hoy y no lo será cuando la promoción crezca. Se calcula una vez
  // por cambio de datos.
  const stats = useMemo(() => buildDashboardStats(clientes), [clientes])
  const dinero = useMemo(() => buildDineroPorCasino(clientes), [clientes])

  if (!stats || !dinero) return null

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black" style={{ fontFamily: "'Inter', sans-serif", color: TINTA.primaria }}>
          Dashboard
        </h2>
        <p className="text-sm mt-1" style={{ color: TINTA.apagada }}>
          Reparto y ritmo de la promoción "Gira y Gana" entre los 3 casinos.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <TarjetaCifra
          etiqueta="Clientes registrados"
          valor={formatNumero(stats.totalClientes)}
          icono={<Users size={22} style={{ color: '#D4AF37' }} />}
          nota={`${formatNumero(stats.sinBono)} sin bono ganado`}
        />
        <TarjetaCifra
          etiqueta="Personas que reclamaron"
          valor={formatNumero(stats.personasQueReclamaron)}
          icono={<CircleCheck size={22} style={{ color: '#22c55e' }} />}
          // Un cliente no puede tener dos bonos (clienteId es @unique en la
          // base), así que este conteo ES el de personas, no una estimación.
          nota="Un bono por persona"
        />
        <TarjetaCifra
          etiqueta="Pendientes de reclamo"
          valor={formatNumero(stats.pendientes)}
          icono={<Clock size={22} style={{ color: '#eab308' }} />}
          nota="Bonos vivos sin redimir"
        />
        {/* La tarjeta de dinero es el disparador del modal: es donde uno la
            busca, y no en un botón suelto en otra esquina. */}
        <button
          type="button"
          onClick={() => setModalDinero(true)}
          className="text-left rounded-2xl border border-[#D4AF37]/25 p-5 hover:border-[#D4AF37]/60 transition-all"
          style={{ background: 'linear-gradient(145deg, #1F1A10, #141109)' }}
        >
          <Wallet size={22} style={{ color: '#b1900f' }} className="mb-3" />
          <p
            className="text-2xl font-black leading-none"
            style={{ fontFamily: "'Inter', sans-serif", color: TINTA.primaria }}
          >
            {formatCOPCorto(dinero.totales.entregado)}
          </p>
          <p className="text-xs mt-1.5" style={{ color: TINTA.tenue }}>
            Dinero entregado
          </p>
          <span className="text-[11px] font-semibold mt-2 inline-block" style={{ color: '#D4AF37' }}>
            Ver detalle por casino →
          </span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
          <h3 className="font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif", color: TINTA.primaria }}>
            Reclamo general
          </h3>
          <Medidor
            razon={stats.tasaReclamoGeneral}
            etiquetaIzquierda={`${formatNumero(stats.personasQueReclamaron)} de ${formatNumero(stats.conBono)} bonos ganados ya se reclamaron.`}
            etiquetaDerecha="de los bonos ganados"
          />

          {/* La tasa sola no dice si el 42% que falta es gente que todavía no
              ha tenido tiempo o gente que ya no va a venir. La demora típica es
              la que lo aclara: si la mediana son 3 días, un bono de hace tres
              semanas sin reclamar ya no es cuestión de tiempo. */}
          {stats.demoraMedianaHoras != null && (
            <div className="mt-5 pt-5 border-t border-[#D4AF37]/10">
              <p className="text-lg font-black tabular-nums" style={{ color: TINTA.primaria }}>
                {formatDemora(Math.round(stats.demoraMedianaHoras * 10) / 10)}
              </p>
              <p className="text-xs mt-1" style={{ color: TINTA.apagada }}>
                Demora típica en venir a reclamar
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: TINTA.minima }}>
                Mediana, no promedio: un solo bono redimido semanas después no
                corre esta cifra.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <TarjetaGrafica
            titulo="Bonos por casino"
            descripcion="Agrupados por el casino donde el premio manda a redimir. Entregado y pendiente son las dos partes del total asignado a esa sede."
            tabla={
              <TablaGrafica
                encabezados={['Casino', 'Entregados', 'Pendientes', 'Asignados', '% reclamado']}
                filas={stats.porSede.map((f) => [
                  f.sede,
                  formatNumero(f.entregados),
                  formatNumero(f.pendientes),
                  formatNumero(f.asignados),
                  `${Math.round(f.tasaReclamo * 100)}%`,
                ])}
              />
            }
          >
            <BarrasSede filas={stats.porSede} />
          </TarjetaGrafica>
        </div>
      </div>

      {/* La gráfica de 7 premios va en las dos columnas anchas y la de 3
          casinos en la angosta: al contrario, la tarjeta de 3 barras quedaba
          con la mitad de su alto vacío al lado de una de 7. */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TarjetaGrafica
            titulo="Bonos por premio"
            descripcion="Qué se está ganando en la ruleta, y cuánto de eso ya pasó por caja."
            tabla={
              <TablaGrafica
                encabezados={['Premio', 'Entregados', 'Pendientes', 'Total']}
                filas={stats.porPremio.map((f) => [
                  f.nombre,
                  formatNumero(f.entregados),
                  formatNumero(f.pendientes),
                  formatNumero(f.total),
                ])}
              />
            }
          >
            <BarrasPremio filas={stats.porPremio} />
          </TarjetaGrafica>
        </div>

        <TarjetaGrafica
          titulo="Dónde se entregaron"
          descripcion="Por el casino donde la cajera redimió el bono: es la caja de la que salió el dinero."
          extra={
            // Solo aparece si de verdad pasó. Un chip en cero sería ruido, y en
            // un panel de auditoría un cero permanente enseña a ignorarlo.
            stats.fueraDeSede > 0 ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#eab308]/35 px-2.5 py-1.5 text-[11px]"
                style={{ background: 'rgba(234,179,8,0.08)', color: '#eab308' }}
                title="Bonos redimidos en un casino distinto al que decía el premio"
              >
                <MapPinOff size={12} />
                {formatNumero(stats.fueraDeSede)} fuera de su sede
              </span>
            ) : undefined
          }
          tabla={
            <TablaGrafica
              encabezados={['Casino', 'Bonos entregados']}
              filas={stats.entregasPorSede.map((f) => [f.sede, formatNumero(f.entregados)])}
            />
          }
        >
          <BarrasEntrega filas={stats.entregasPorSede} />
        </TarjetaGrafica>
      </div>

      <TarjetaGrafica
        titulo="Ritmo de entrega"
        descripcion="Bonos entregados acumulados por casino. Pasa el mouse —o recorre con las flechas del teclado— para ver cualquier día."
        tabla={
          <TablaGrafica
            encabezados={['Día', ...stats.sedesConEntrega.map((s) => s.replace('Gran Casino Cúcuta ', ''))]}
            // Lo más reciente primero: en una tabla larga es lo que se busca.
            filas={[...stats.serie].reverse().map((punto) => [
              formatDiaCorto(punto.dia),
              ...stats.sedesConEntrega.map((sede) => formatNumero(punto.acumulado[sede] ?? 0)),
            ])}
          />
        }
      >
        <LineasRitmo serie={stats.serie} sedes={stats.sedesConEntrega} />
      </TarjetaGrafica>

      {modalDinero && <DineroCasinosModal clientes={clientes} onCerrar={() => setModalDinero(false)} />}
    </div>
  )
}

// TARJETA DE CIFRA
//
// La cifra va en dígitos proporcionales, sin `tabular-nums`: a este tamaño los
// dígitos de ancho fijo dejan un número como 121 flojo y desarmado. El ancho
// fijo se reserva para columnas que tienen que alinearse entre filas, que es
// lo que hacen las tablas de las gráficas.
function TarjetaCifra({
  etiqueta,
  valor,
  icono,
  nota,
}: {
  etiqueta: string
  valor: string
  icono: ReactNode
  nota?: string
}) {
  return (
    <div
      className="rounded-2xl border border-[#D4AF37]/15 p-5"
      style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
    >
      <div className="mb-3">{icono}</div>
      <p className="text-2xl font-black leading-none" style={{ fontFamily: "'Inter', sans-serif", color: TINTA.primaria }}>
        {valor}
      </p>
      <p className="text-xs mt-1.5" style={{ color: TINTA.tenue }}>
        {etiqueta}
      </p>
      {nota && (
        <p className="text-[11px] mt-2" style={{ color: TINTA.minima }}>
          {nota}
        </p>
      )}
    </div>
  )
}
