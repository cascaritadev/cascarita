'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Stats = {
  kpis: {
    totalRevenue: number
    monthRevenue: number
    prevMonthRevenue: number
    revenueGrowth: number
    totalOrders: number
    paidOrders: number
    monthOrders: number
    avgTicket: number
    avgShipDays: number
    usersCount: number
  }
  statusCounts: Record<string, number>
  conversion: { paid: number; shipped: number; delivered: number }
  rankings: {
    boxes: { key: string; count: number }[]
    tallas: { key: string; count: number }[]
    cities: { key: string; count: number }[]
    states: { key: string; count: number }[]
    exclusions: { key: string; count: number }[]
  }
  promos: {
    totalOrders: number
    totalDiscount: number
    byPerson: {
      person: string
      orders: number
      revenue: number
      discount: number
      codes: string[]
      vipUses: number
      influencerUses: number
    }[]
  }
  salesByDay: { date: string; revenue: number; orders: number }[]
  insights: string[]
}

const BOX_LABELS: Record<string, string> = {
  debutante: 'La Inicial',
  doble: 'Doble',
  'hat-trick': 'Hat-Trick',
  'jersey-club': 'Escuadra',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-400',
  PAID: 'bg-blue-400',
  PROCESSING: 'bg-purple-400',
  SHIPPED: 'bg-emerald-400',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
}

function formatMoney(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export default function DashboardPage() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/admin/dashboard')
      return
    }
    if (status === 'authenticated') fetchStats()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchStats() {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    if (res.ok) setStats(await res.json())
    setLoading(false)
  }

  if (status === 'loading' || loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
      </div>
    )
  }

  const { kpis, statusCounts, conversion, rankings, promos, salesByDay, insights } = stats
  const maxRevenueDay = Math.max(...salesByDay.map((d) => d.revenue), 1)
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1)
  const conversionRateShipped = conversion.paid > 0 ? Math.round((conversion.shipped / conversion.paid) * 100) : 0
  const conversionRateDelivered = conversion.paid > 0 ? Math.round((conversion.delivered / conversion.paid) * 100) : 0

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl uppercase tracking-tighter">Dashboard · La Cascarita</h1>
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mt-0.5">Estadísticas y métricas</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="px-4 py-2 text-xs font-black uppercase tracking-wider border border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-primary transition-colors"
          >
            Pedidos
          </Link>
          <button
            onClick={fetchStats}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-emerald-300 text-primary hover:opacity-90 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Actualizar
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">

        {/* RESUMEN EJECUTIVO */}
        <section className="bg-primary text-white p-6 border border-primary">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-emerald-300">insights</span>
            <h2 className="font-headline font-black text-lg uppercase tracking-tight">Resumen ejecutivo</h2>
          </div>
          {insights.length === 0 ? (
            <p className="text-emerald-100 text-sm">Aún no hay suficientes datos para generar insights.</p>
          ) : (
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex gap-2 text-sm text-emerald-50">
                  <span className="text-emerald-300 font-black">›</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* KPIs PRINCIPALES */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Indicadores clave</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              label="Ingresos totales"
              value={formatMoney(kpis.totalRevenue)}
              hint={`${kpis.paidOrders} pedidos pagados`}
              icon="payments"
            />
            <KpiCard
              label="Ingresos del mes"
              value={formatMoney(kpis.monthRevenue)}
              hint={
                kpis.revenueGrowth !== 0
                  ? `${kpis.revenueGrowth > 0 ? '↑' : '↓'} ${Math.abs(kpis.revenueGrowth)}% vs mes anterior`
                  : 'Sin comparación previa'
              }
              hintColor={kpis.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}
              icon="trending_up"
            />
            <KpiCard
              label="Ticket promedio"
              value={formatMoney(kpis.avgTicket)}
              hint="Por pedido pagado"
              icon="receipt_long"
            />
            <KpiCard
              label="Pedidos del mes"
              value={kpis.monthOrders.toString()}
              hint={`${kpis.totalOrders} totales`}
              icon="shopping_bag"
            />
            <KpiCard
              label="Usuarios registrados"
              value={kpis.usersCount.toString()}
              hint="Cuentas creadas"
              icon="group"
            />
            <KpiCard
              label="Tiempo de envío"
              value={kpis.avgShipDays > 0 ? `${kpis.avgShipDays} d` : '—'}
              hint="Promedio para enviar"
              icon="local_shipping"
            />
            <KpiCard
              label="Tasa de envío"
              value={`${conversionRateShipped}%`}
              hint={`${conversion.shipped} de ${conversion.paid} pagados`}
              icon="outbox"
            />
            <KpiCard
              label="Tasa de entrega"
              value={`${conversionRateDelivered}%`}
              hint={`${conversion.delivered} de ${conversion.paid} pagados`}
              icon="task_alt"
            />
          </div>
        </section>

        {/* GRÁFICO VENTAS POR DÍA */}
        <section className="bg-white border border-zinc-100 p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ventas últimos 30 días</h2>
            <span className="text-xs text-zinc-400">
              {salesByDay.reduce((s, d) => s + d.orders, 0)} pedidos · {formatMoney(salesByDay.reduce((s, d) => s + d.revenue, 0))}
            </span>
          </div>
          <div className="flex items-end gap-1 h-48 border-b border-zinc-100">
            {salesByDay.map((d) => {
              const heightPct = (d.revenue / maxRevenueDay) * 100
              return (
                <div
                  key={d.date}
                  className="flex-1 group relative flex flex-col justify-end"
                  title={`${d.date}: ${formatMoney(d.revenue)} · ${d.orders} pedidos`}
                >
                  <div
                    className="bg-primary hover:bg-emerald-600 transition-colors w-full min-h-[1px]"
                    style={{ height: `${heightPct}%` }}
                  />
                  {d.revenue > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 whitespace-nowrap pointer-events-none">
                      {formatMoney(d.revenue)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
            <span>{new Date(salesByDay[0].date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
            <span>Hoy</span>
          </div>
        </section>

        {/* STATUS + CONVERSIÓN */}
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white border border-zinc-100 p-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Distribución por status</h2>
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 w-20">
                    {STATUS_LABELS[status]}
                  </span>
                  <div className="flex-1 bg-zinc-100 h-6 relative">
                    <div
                      className={`h-full ${STATUS_COLORS[status]} transition-all`}
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-zinc-700 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-zinc-100 p-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Embudo de conversión</h2>
            <div className="space-y-3">
              <FunnelStep label="Pagados" value={conversion.paid} pct={100} />
              <FunnelStep label="Enviados" value={conversion.shipped} pct={conversionRateShipped} />
              <FunnelStep label="Entregados" value={conversion.delivered} pct={conversionRateDelivered} />
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Pagado → Enviado</p>
                <p className="font-headline font-black text-2xl text-primary">{conversionRateShipped}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Pagado → Entregado</p>
                <p className="font-headline font-black text-2xl text-primary">{conversionRateDelivered}%</p>
              </div>
            </div>
          </section>
        </div>

        {/* RANKINGS */}
        <div className="grid md:grid-cols-2 gap-6">
          <RankingCard
            title="Cajas más vendidas"
            icon="inventory_2"
            items={rankings.boxes.map((b) => ({ key: BOX_LABELS[b.key] ?? b.key, count: b.count }))}
            emptyMsg="Aún no hay ventas registradas."
          />
          <RankingCard
            title="Tallas más pedidas"
            icon="straighten"
            items={rankings.tallas.map((t) => ({ key: t.key.toUpperCase(), count: t.count }))}
            emptyMsg="Sin datos de tallas."
          />
          <RankingCard
            title="Top ciudades"
            icon="location_on"
            items={rankings.cities}
            emptyMsg="Sin direcciones registradas."
          />
          <RankingCard
            title="Top estados"
            icon="map"
            items={rankings.states}
            emptyMsg="Sin estados registrados."
          />
          <RankingCard
            title="Equipos más excluidos"
            icon="block"
            items={rankings.exclusions}
            emptyMsg="Nadie ha excluido equipos."
            danger
          />
        </div>

        {/* CÓDIGOS PROMOCIONALES */}
        <section className="bg-white border border-zinc-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-emerald-500">local_offer</span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Códigos promocionales por influencer</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <KpiCard
              label="Pedidos con código"
              value={promos.totalOrders.toString()}
              hint={`de ${kpis.paidOrders} pagados`}
              icon="redeem"
            />
            <KpiCard
              label="Descuento otorgado"
              value={formatMoney(promos.totalDiscount)}
              hint="Total rebajado"
              icon="percent"
              hintColor="text-red-500"
            />
            <KpiCard
              label="Ingresos c/ código"
              value={formatMoney(promos.byPerson.reduce((s, p) => s + p.revenue, 0))}
              hint="Atribuidos a influencers"
              icon="trending_up"
            />
            <KpiCard
              label="Influencers activos"
              value={promos.byPerson.length.toString()}
              hint="Con al menos 1 venta"
              icon="group"
            />
          </div>

          {promos.byPerson.length === 0 ? (
            <p className="text-zinc-400 text-xs italic">Aún nadie ha usado un código promocional.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-left">
                    <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Persona</th>
                    <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Códigos</th>
                    <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Pedidos</th>
                    <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">VIP</th>
                    <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Influencer</th>
                    <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Descuento</th>
                    <th className="py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.byPerson.map((p) => (
                    <tr key={p.person} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="py-3 pr-3 font-black text-zinc-800 uppercase tracking-wide">{p.person}</td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-1">
                          {p.codes.map((c) => (
                            <span key={c} className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-3 font-bold text-zinc-700 text-right">{p.orders}</td>
                      <td className="py-3 pr-3 text-zinc-500 text-right">{p.vipUses}</td>
                      <td className="py-3 pr-3 text-zinc-500 text-right">{p.influencerUses}</td>
                      <td className="py-3 pr-3 text-red-500 font-bold text-right">−{formatMoney(p.discount)}</td>
                      <td className="py-3 font-black text-primary text-right">{formatMoney(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  hintColor = 'text-zinc-400',
}: {
  label: string
  value: string
  hint: string
  icon: string
  hintColor?: string
}) {
  return (
    <div className="bg-white border border-zinc-100 p-4">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
        <span className="material-symbols-outlined text-zinc-300 text-base">{icon}</span>
      </div>
      <p className="font-headline font-black text-2xl text-primary mt-2 tracking-tight">{value}</p>
      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${hintColor}`}>{hint}</p>
    </div>
  )
}

function FunnelStep({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className="uppercase tracking-wider text-zinc-600">{label}</span>
        <span className="text-zinc-400">{value} ({pct}%)</span>
      </div>
      <div className="h-3 bg-zinc-100 relative overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function RankingCard({
  title,
  icon,
  items,
  emptyMsg,
  danger = false,
}: {
  title: string
  icon: string
  items: { key: string; count: number }[]
  emptyMsg: string
  danger?: boolean
}) {
  const max = Math.max(...items.map((i) => i.count), 1)
  return (
    <section className="bg-white border border-zinc-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={`material-symbols-outlined text-base ${danger ? 'text-red-400' : 'text-zinc-400'}`}>{icon}</span>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="text-zinc-400 text-xs italic">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.key} className="flex items-center gap-3">
              <span className="text-[10px] font-black text-zinc-300 w-4">{i + 1}</span>
              <span className="text-xs font-bold text-zinc-700 truncate flex-1 min-w-0">{item.key}</span>
              <div className="w-24 bg-zinc-100 h-2 relative">
                <div
                  className={`h-full ${danger ? 'bg-red-400' : 'bg-primary'}`}
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
              <span className="text-xs font-black text-zinc-700 w-6 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
