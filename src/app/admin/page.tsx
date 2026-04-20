'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Order = {
  id: string
  email: string
  status: string
  boxType: string
  categoria: string
  talla: string
  exclusiones: string[]
  amountTotal: number
  trackingNumber: string | null
  trackingUrl: string | null
  shippingName: string | null
  shippingCity: string | null
  shippingState: string | null
  shippedAt: string | null
  estimatedDelivery: string | null
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  PAID:       'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED:    'bg-emerald-100 text-emerald-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendiente',
  PAID:       'Pagado',
  PROCESSING: 'Preparando',
  SHIPPED:    'Enviado',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}

const BOX_LABELS: Record<string, string> = {
  debutante:     'La Inicial',
  doble:         'Doblete',
  'hat-trick':   'Hat-Trick',
  'jersey-club': 'Poker',
}

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editTracking, setEditTracking] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editEta, setEditEta] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [emailSending, setEmailSending] = useState<string | null>(null)
  const [emailToast, setEmailToast] = useState<{ id: string; msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/admin')
      return
    }
    if (status === 'authenticated') fetchOrders()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchOrders() {
    setLoading(true)
    const res = await fetch('/api/admin/orders/all')
    if (res.ok) {
      const data = await res.json()
      setOrders(data)
    }
    setLoading(false)
  }

  function startEdit(order: Order) {
    setEditing(order.id)
    setEditTracking(order.trackingNumber ?? '')
    setEditStatus(order.status)
    // Convertir a formato yyyy-MM-dd para el input date
    setEditEta(order.estimatedDelivery
      ? new Date(order.estimatedDelivery).toISOString().split('T')[0]
      : '')
  }

  async function sendEmail(orderId: string, type: 'confirmation' | 'shipping' | 'status') {
    setEmailSending(`${orderId}-${type}`)
    const res = await fetch(`/api/admin/orders/${orderId}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const data = await res.json()
    setEmailToast({ id: orderId, msg: res.ok ? 'Correo enviado ✓' : (data.error ?? 'Error'), ok: res.ok })
    setEmailSending(null)
    setTimeout(() => setEmailToast(null), 3000)
  }

  async function saveEdit(orderId: string) {
    setSaving(true)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: editStatus,
        trackingNumber: editTracking,
        estimatedDelivery: editEta || null,
      }),
    })
    setSaving(false)
    setEditing(null)
    fetchOrders()
  }

  const displayed = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl uppercase tracking-tighter">Admin · La Cascarita</h1>
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mt-0.5">Panel de pedidos</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 text-xs font-black uppercase tracking-wider border border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            Dashboard
          </Link>
          <span className="text-xs text-emerald-300 font-bold uppercase">
            {orders.length} pedidos en total
          </span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">

        {/* Filtros de status */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['ALL', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                filter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-zinc-500 border-zinc-200 hover:border-primary hover:text-primary'
              }`}
            >
              {s === 'ALL' ? 'Todos' : STATUS_LABELS[s]}
              {s !== 'ALL' && (
                <span className="ml-1.5 opacity-60">
                  ({orders.filter((o) => o.status === s).length})
                </span>
              )}
            </button>
          ))}
          <button
            onClick={fetchOrders}
            className="ml-auto px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-zinc-200 bg-white hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Actualizar
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-zinc-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Fecha</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliente</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Box / Talla</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Categoría / Excl.</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Guía Estafeta</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Entrega estimada</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400"></th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-zinc-400 text-sm">
                    No hay pedidos en esta categoría.
                  </td>
                </tr>
              )}
              {displayed.map((order) => (
                <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-bold text-xs">
                      {new Date(order.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-bold text-xs truncate max-w-[160px]">{order.shippingName ?? '—'}</p>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[160px]">{order.email}</p>
                    {order.shippingCity && (
                      <p className="text-[10px] text-zinc-400">{order.shippingCity}, {order.shippingState}</p>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-bold text-xs">{BOX_LABELS[order.boxType] ?? order.boxType}</p>
                    <p className="text-[10px] text-zinc-400 uppercase">{order.talla}</p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-bold text-xs capitalize">{order.categoria}</p>
                    {order.exclusiones.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {order.exclusiones.map((eq) => (
                          <span key={eq} className="bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {eq}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-300 italic">Sin excl.</p>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-black text-primary text-sm">
                      ${(order.amountTotal / 100).toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">MXN</span>
                  </td>

                  <td className="px-4 py-3">
                    {editing === order.id ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="border border-zinc-200 text-xs font-bold px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editing === order.id ? (
                      <input
                        type="text"
                        value={editTracking}
                        onChange={(e) => setEditTracking(e.target.value)}
                        placeholder="Número de guía Estafeta"
                        className="border border-zinc-200 text-xs px-2 py-1 outline-none focus:ring-1 focus:ring-primary w-44"
                      />
                    ) : order.trackingNumber ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-zinc-700">{order.trackingNumber}</span>
                        {order.trackingUrl && (
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                            <span className="material-symbols-outlined text-zinc-400 hover:text-primary text-sm">open_in_new</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-300 text-xs italic">Sin guía</span>
                    )}
                  </td>

                  {/* Entrega estimada */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editing === order.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={editEta}
                          onChange={(e) => setEditEta(e.target.value)}
                          className="border border-zinc-200 text-xs px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                        />
                        {editStatus === 'SHIPPED' && !editEta && (
                          <span className="text-[9px] text-zinc-400">Vacío = auto (+5 días hábiles)</span>
                        )}
                      </div>
                    ) : order.estimatedDelivery ? (
                      <span className="text-xs font-bold">
                        {new Date(order.estimatedDelivery).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    ) : order.shippedAt ? (
                      <span className="text-[10px] text-zinc-400 italic">Auto (+5 días)</span>
                    ) : (
                      <span className="text-zinc-300 text-xs italic">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {editing === order.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(order.id)}
                          disabled={saving}
                          className="bg-primary text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                        >
                          {saving ? (
                            <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-xs">check</span>
                          )}
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="border border-zinc-200 text-zinc-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider hover:border-zinc-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => startEdit(order)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-wider"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Editar
                        </button>
                        <div className="flex gap-1">
                          <button
                            title="Reenviar confirmación de pago"
                            disabled={emailSending === `${order.id}-confirmation`}
                            onClick={() => sendEmail(order.id, 'confirmation')}
                            className="px-1.5 py-1 text-[9px] font-black uppercase tracking-wider border border-blue-200 text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                          >
                            {emailSending === `${order.id}-confirmation`
                              ? <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                              : <span className="material-symbols-outlined text-xs">payment</span>}
                          </button>
                          <button
                            title="Enviar correo de guía/tracking"
                            disabled={emailSending === `${order.id}-shipping` || !order.trackingNumber}
                            onClick={() => sendEmail(order.id, 'shipping')}
                            className="px-1.5 py-1 text-[9px] font-black uppercase tracking-wider border border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
                          >
                            {emailSending === `${order.id}-shipping`
                              ? <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                              : <span className="material-symbols-outlined text-xs">local_shipping</span>}
                          </button>
                          <button
                            title="Enviar correo de cambio de status"
                            disabled={emailSending === `${order.id}-status`}
                            onClick={() => sendEmail(order.id, 'status')}
                            className="px-1.5 py-1 text-[9px] font-black uppercase tracking-wider border border-purple-200 text-purple-500 hover:bg-purple-50 disabled:opacity-40 transition-colors"
                          >
                            {emailSending === `${order.id}-status`
                              ? <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                              : <span className="material-symbols-outlined text-xs">notifications</span>}
                          </button>
                        </div>
                        {emailToast?.id === order.id && (
                          <p className={`text-[9px] font-bold ${emailToast.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                            {emailToast.msg}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
