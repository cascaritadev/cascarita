// Estafeta REST API client
// Credenciales requeridas en .env:
//   ESTAFETA_CLIENT_ID
//   ESTAFETA_CLIENT_SECRET
//   ESTAFETA_CUSTOMER_NUMBER (número de cliente asignado por Estafeta)

const ESTAFETA_API = 'https://api.estafeta.com'

export type EstafetaEvent = {
  date: string
  description: string
  location: string
}

export type EstafetaTrackingResult = {
  status: string          // último status de Estafeta
  statusLabel: string     // etiqueta legible
  events: EstafetaEvent[]
  estimatedDelivery?: string
  error?: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────

let _cachedToken: string | null = null
let _tokenExpiry = 0

async function getAccessToken(): Promise<string | null> {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken

  const clientId = process.env.ESTAFETA_CLIENT_ID
  const clientSecret = process.env.ESTAFETA_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  try {
    const res = await fetch(`${ESTAFETA_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'execute',
      }),
      next: { revalidate: 0 },
    })

    if (!res.ok) return null

    const data = await res.json()
    _cachedToken = data.access_token ?? null
    _tokenExpiry = Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000
    return _cachedToken
  } catch {
    return null
  }
}

// ── Status mapping ────────────────────────────────────────────────────────────

const ESTAFETA_STATUS_MAP: Record<string, string> = {
  'D': 'Entregado',
  'T': 'En tránsito',
  'R': 'En reparto',
  'N': 'En proceso',
  'E': 'Excepción',
  'I': 'Información recibida',
}

function mapStatus(code: string): string {
  return ESTAFETA_STATUS_MAP[code?.toUpperCase()] ?? 'En proceso'
}

// ── Tracking ──────────────────────────────────────────────────────────────────

export async function getEstafetaTracking(trackingNumber: string): Promise<EstafetaTrackingResult> {
  const token = await getAccessToken()

  if (!token) {
    // Sin credenciales: devolvemos vacío sin error bloqueante.
    // El rastreador mostrará el status interno de la BD.
    return { status: 'no_credentials', statusLabel: 'Sin integración activa', events: [] }
  }

  try {
    const customerNumber = process.env.ESTAFETA_CUSTOMER_NUMBER ?? ''

    const res = await fetch(`${ESTAFETA_API}/v2/trackingInfo/byTrackingNumber`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isCod: false,
        wayBillType: 'SINGLE',
        wayBill: trackingNumber,
        customerNumber,
      }),
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[Estafeta] Tracking error:', err)
      return { status: 'error', statusLabel: 'Error al consultar', events: [], error: err?.message }
    }

    const data = await res.json()

    // La respuesta de Estafeta varía según versión; intentamos ambos formatos
    const shipment =
      data?.trackingData?.[0] ??
      data?.data?.[0] ??
      data?.[0] ??
      null

    if (!shipment) {
      return { status: 'not_found', statusLabel: 'Sin datos del carrier', events: [] }
    }

    const rawEvents =
      shipment.TrackingEvents ??
      shipment.trackingEvents ??
      shipment.events ??
      []

    const events: EstafetaEvent[] = rawEvents.map(
      (e: Record<string, string>) => ({
        date: e.EventDate ?? e.eventDate ?? e.date ?? '',
        description: e.EventDescription ?? e.description ?? e.EventCode ?? '',
        location: e.EventCity ?? e.location ?? '',
      })
    )

    const rawStatus =
      shipment.Status ?? shipment.status ?? shipment.lastStatus ?? ''

    return {
      status: rawStatus,
      statusLabel: mapStatus(rawStatus),
      events,
      estimatedDelivery: shipment.EstimatedDelivery ?? shipment.estimatedDelivery,
    }
  } catch (err) {
    console.error('[Estafeta] Exception:', err)
    return { status: 'error', statusLabel: 'Error de conexión', events: [], error: 'Error de conexión con Estafeta' }
  }
}

// URL pública de rastreo de Estafeta (útil para el botón "Ver en Estafeta")
export function getEstafetaTrackingUrl(trackingNumber: string): string {
  return `https://rastreo.estafeta.com/?trackingNumber=${encodeURIComponent(trackingNumber)}`
}
