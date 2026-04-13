// SkyDropX API client
// Docs: https://developers.skydropx.com/

const SKYDROPX_BASE = 'https://api.skydropx.com/v1'

type Address = {
  name: string
  company?: string
  phone: string
  email: string
  address1: string
  address2?: string
  city: string
  province: string
  zip: string
  country_code: string
}

type Parcel = {
  weight: number      // kg
  height: number      // cm
  width: number       // cm
  length: number      // cm
  mass_unit?: string  // 'kg'
  distance_unit?: string // 'cm'
}

type ShipmentPayload = {
  address_from: Address
  address_to: Address
  parcel: Parcel
  consignment_note_class_code?: string
}

type CreateShipmentResult = {
  id: string
  label_url?: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  error?: string
}

type TrackingEvent = {
  status: string
  description: string
  location: string
  occurred_at: string
}

type TrackingResult = {
  status: string
  tracking_number: string
  events: TrackingEvent[]
  estimated_delivery?: string
  error?: string
}

function getOriginAddress(): Address {
  return {
    name: process.env.ORIGIN_NAME!,
    company: process.env.ORIGIN_COMPANY,
    phone: process.env.ORIGIN_PHONE!,
    email: process.env.ORIGIN_EMAIL!,
    address1: process.env.ORIGIN_ADDRESS!,
    city: process.env.ORIGIN_CITY!,
    province: process.env.ORIGIN_PROVINCE!,
    zip: process.env.ORIGIN_ZIP!,
    country_code: process.env.ORIGIN_COUNTRY ?? 'MX',
  }
}

// Peso estimado por caja (kg)
const BOX_WEIGHTS: Record<string, number> = {
  debutante: 0.6,
  doble: 1.1,
  'hat-trick': 1.5,
  'jersey-club': 2.0,
}

export async function createShipment(params: {
  boxType: string
  addressTo: {
    name: string
    phone: string
    email: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
}): Promise<CreateShipmentResult> {
  const weight = BOX_WEIGHTS[params.boxType] ?? 0.6

  const payload: ShipmentPayload = {
    address_from: getOriginAddress(),
    address_to: {
      name: params.addressTo.name,
      phone: params.addressTo.phone,
      email: params.addressTo.email,
      address1: params.addressTo.line1,
      address2: params.addressTo.line2,
      city: params.addressTo.city,
      province: params.addressTo.state,
      zip: params.addressTo.zip,
      country_code: params.addressTo.country ?? 'MX',
    },
    parcel: {
      weight,
      height: 30,
      width: 25,
      length: 10,
      mass_unit: 'kg',
      distance_unit: 'cm',
    },
  }

  try {
    const res = await fetch(`${SKYDROPX_BASE}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token token=${process.env.SKYDROPX_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[SkyDropX] Error creating shipment:', data)
      return { id: '', error: data?.message ?? 'Error creando envío' }
    }

    // SkyDropX returns rates — pick the cheapest one and buy it
    const rates: { id: string; total_pricing: number; provider: string }[] =
      data.included?.filter((i: { type: string }) => i.type === 'rates') ?? []

    if (rates.length === 0) {
      return { id: data.data?.id ?? '', error: 'Sin tarifas disponibles' }
    }

    // Siempre elige la más barata (el usuario ve "envío gratis")
    const cheapest = rates.sort((a, b) => a.total_pricing - b.total_pricing)[0]

    // Purchase the rate to get label
    const purchaseRes = await fetch(`${SKYDROPX_BASE}/shipments/${data.data.id}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token token=${process.env.SKYDROPX_API_KEY}`,
      },
      body: JSON.stringify({ rate_id: cheapest.id }),
    })

    const purchaseData = await purchaseRes.json()

    return {
      id: data.data.id,
      label_url: purchaseData.data?.attributes?.label_url,
      tracking_number: purchaseData.data?.attributes?.tracking_number,
      tracking_url: purchaseData.data?.attributes?.tracking_url,
      carrier: cheapest.provider,
    }
  } catch (err) {
    console.error('[SkyDropX] Exception:', err)
    return { id: '', error: 'Error de conexión con SkyDropX' }
  }
}

export async function getTracking(shipmentId: string): Promise<TrackingResult> {
  try {
    const res = await fetch(`${SKYDROPX_BASE}/shipments/${shipmentId}/trackings`, {
      headers: {
        Authorization: `Token token=${process.env.SKYDROPX_API_KEY}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return { status: 'unknown', tracking_number: '', events: [], error: data?.message }
    }

    const attrs = data.data?.attributes ?? {}
    const events: TrackingEvent[] = (data.included ?? [])
      .filter((i: { type: string }) => i.type === 'tracking_histories')
      .map((e: { attributes: { status: string; description: string; location: string; occurred_at: string } }) => ({
        status: e.attributes.status,
        description: e.attributes.description,
        location: e.attributes.location,
        occurred_at: e.attributes.occurred_at,
      }))

    return {
      status: attrs.status ?? 'unknown',
      tracking_number: attrs.tracking_number ?? '',
      events,
      estimated_delivery: attrs.estimated_delivery,
    }
  } catch (err) {
    console.error('[SkyDropX] Tracking error:', err)
    return { status: 'unknown', tracking_number: '', events: [], error: 'Error de conexión' }
  }
}
