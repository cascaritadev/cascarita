import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const BOX_NAMES: Record<string, string> = {
  debutante: 'Mystery Box Debutante',
  doble: 'Mystery Box Doblete',
  'hat-trick': 'Mystery Box Hat-Trick',
  'jersey-club': 'Mystery Box Poker',
}

function formatMXN(centavos: number) {
  return '$' + (centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 }) + ' MXN'
}

type JerseySlotEmail = {
  talla: string
  tipo: string
  estampado?: boolean
  nombreEstampado?: string
  numeroEstampado?: string
}

type OrderEmailData = {
  orderId: string
  email: string
  shippingName: string | null
  boxType: string
  categoria: string
  talla: string
  exclusiones: string[]
  mensajeRegalo?: string | null
  estampado?: boolean
  nombreEstampado?: string | null
  numeroEstampado?: string | null
  jerseySlots?: JerseySlotEmail[] | null
  amountTotal: number
  amountSubtotal: number | null
  amountDiscount: number | null
  promoCode: string | null
  shippingCity: string | null
  shippingState: string | null
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const nombre = order.shippingName?.split(' ')[0] ?? 'Cliente'
  const boxName = BOX_NAMES[order.boxType] ?? order.boxType
  const shortId = order.orderId.slice(-8).toUpperCase()

  // Detalle de jerseys: multi-jersey con slots o debutante/retro simple
  const jerseyDetailRows = order.jerseySlots?.length
    ? order.jerseySlots.map((s, i) => `
        <tr>
          <td colspan="2" style="padding:2px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#444444;">
            JERSEY ${i + 1}: ${s.tipo.toUpperCase()} · ${s.talla.toUpperCase()}
            ${s.estampado
              ? ` &nbsp;<span style="color:#003625;font-weight:700;">· ESTAMPADO: ${(s.nombreEstampado ?? '—').toUpperCase()} #${s.numeroEstampado ?? '—'} (+$200)</span>`
              : ''}
          </td>
        </tr>`).join('')
    : `<tr>
        <td colspan="2" style="padding:0 0 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888888;">
          TIPO: ${order.categoria.toUpperCase()} &nbsp;·&nbsp; TALLA: ${order.talla.toUpperCase()}
          ${order.exclusiones.length ? `<br>SIN: ${order.exclusiones.join(', ').toUpperCase()}` : ''}
          ${order.estampado
            ? `<br><span style="color:#003625;font-weight:700;">ESTAMPADO: ${(order.nombreEstampado ?? '—').toUpperCase()} #${order.numeroEstampado ?? '—'} (+$200)</span>`
            : ''}
        </td>
      </tr>`

  const mensajeRow = order.mensajeRegalo
    ? `<tr>
        <td colspan="2" style="padding:10px 0;border-top:1px dashed #e5e5e5;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888888;">
          🎁 MENSAJE DE REGALO
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 0 10px;font-size:12px;color:#444444;font-style:italic;">"${order.mensajeRegalo}"</td>
      </tr>`
    : ''

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#E9E2C5;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#E9E2C5;padding:48px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">

        <!-- TICKET TOP: Nombre de marca -->
        <tr>
          <td style="background:#003625;padding:32px 36px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#ffffff;font-family:'Courier New',Courier,monospace;">LA CASCARITA</p>
            <p style="margin:6px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7ab99a;font-family:'Courier New',Courier,monospace;">JERSEY CLUB</p>
          </td>
        </tr>

        <!-- DIVIDER con muescas tipo ticket -->
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="20" style="background:#E9E2C5;border-radius:0 20px 20px 0;height:24px;"></td>
                <td style="border-top:2px dashed #c8bfa0;height:24px;"></td>
                <td width="20" style="background:#E9E2C5;border-radius:20px 0 0 20px;height:24px;"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TICKET BOTTOM: Contenido -->
        <tr>
          <td style="padding:28px 36px 36px;">

            <p style="margin:0 0 4px;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;color:#0a0a0a;">
              PEDIDO CONFIRMADO
            </p>
            <p style="margin:0 0 24px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888888;">
              HOLA ${nombre.toUpperCase()} — RECIBIMOS TU PAGO
            </p>

            <!-- Fila: caja -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5;padding-top:0;">
              <tr>
                <td style="padding:12px 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888888;">PRODUCTO</td>
                <td style="padding:12px 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888888;text-align:right;">PRECIO</td>
              </tr>
              <tr>
                <td style="padding:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;color:#0a0a0a;">${boxName.toUpperCase()}</td>
                <td style="padding:0 0 8px;font-size:13px;font-weight:700;color:#0a0a0a;text-align:right;">${order.amountSubtotal ? formatMXN(order.amountSubtotal) : ''}</td>
              </tr>
              ${jerseyDetailRows}
              ${order.jerseySlots?.length && order.exclusiones.length ? `
              <tr>
                <td colspan="2" style="padding:2px 0 10px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888888;">
                  SIN: ${order.exclusiones.join(', ').toUpperCase()}
                </td>
              </tr>` : ''}
              ${mensajeRow}

              ${order.amountDiscount && order.amountDiscount > 0 ? `
              <tr>
                <td style="padding:8px 0;border-top:1px solid #e5e5e5;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#003625;font-weight:700;">
                  DESCUENTO${order.promoCode ? ` · ${order.promoCode.toUpperCase()}` : ''}
                </td>
                <td style="padding:8px 0;border-top:1px solid #e5e5e5;font-size:11px;font-weight:700;color:#003625;text-align:right;">−${formatMXN(order.amountDiscount)}</td>
              </tr>` : ''}

              <!-- Total -->
              <tr>
                <td style="padding:12px 0 0;border-top:2px solid #0a0a0a;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#0a0a0a;">TOTAL PAGADO</td>
                <td style="padding:12px 0 0;border-top:2px solid #0a0a0a;font-size:18px;font-weight:900;color:#003625;text-align:right;">${formatMXN(order.amountTotal)}</td>
              </tr>
            </table>

            ${order.shippingCity ? `
            <!-- Envío -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid #e5e5e5;">
              <tr>
                <td style="padding:12px 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888888;">ENVÍO A</td>
              </tr>
              <tr>
                <td style="font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:700;color:#0a0a0a;">
                  ${(order.shippingName ?? '').toUpperCase()}<br>
                  <span style="font-weight:400;color:#555555;">${order.shippingCity.toUpperCase()}, ${(order.shippingState ?? '').toUpperCase()}</span>
                </td>
              </tr>
            </table>` : ''}

            <!-- Nota final -->
            <p style="margin:24px 0 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888888;line-height:1.8;">
              TE AVISAREMOS CUANDO TU PAQUETE SALGA<br>
              DUDAS: @CASCARITAJC EN INSTAGRAM<br>
              <span style="color:#003625;font-weight:700;">PEDIDO #${shortId}</span>
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#003625;padding:16px 36px;text-align:center;">
            <p style="margin:0;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7ab99a;">
              CASCARITAJC.COM &nbsp;·&nbsp; CONTACTO@CASCARITAJC.COM
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: `"La Cascarita Jersey Club" <${process.env.GMAIL_USER}>`,
    to: order.email,
    subject: `¡Tu Mystery Box está confirmada! 🎽 #${shortId}`,
    html,
  })
}

// ─── EMAIL: GUÍA GENERADA ────────────────────────────────────────────────────

type ShippingEmailData = {
  orderId: string
  email: string
  shippingName: string | null
  trackingNumber: string
  trackingUrl: string | null
  carrier: string | null
  estimatedDelivery: string | null
}

export async function sendShippingEmail(order: ShippingEmailData) {
  const nombre = order.shippingName?.split(' ')[0] ?? 'Cliente'
  const shortId = order.orderId.slice(-8).toUpperCase()

  const etaRow = order.estimatedDelivery
    ? `<tr><td style="padding:6px 0 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888888;">ENTREGA ESTIMADA</td></tr>
       <tr><td style="font-size:13px;font-weight:700;color:#0a0a0a;">${new Date(order.estimatedDelivery).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>`
    : ''

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#E9E2C5;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#E9E2C5;padding:48px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#003625;padding:32px 36px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#ffffff;font-family:'Courier New',Courier,monospace;">LA CASCARITA</p>
            <p style="margin:6px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7ab99a;font-family:'Courier New',Courier,monospace;">JERSEY CLUB</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="20" style="background:#E9E2C5;border-radius:0 20px 20px 0;height:24px;"></td>
              <td style="border-top:2px dashed #c8bfa0;height:24px;"></td>
              <td width="20" style="background:#E9E2C5;border-radius:20px 0 0 20px;height:24px;"></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px 36px;">
            <p style="margin:0 0 4px;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;color:#0a0a0a;">¡TU PAQUETE ESTÁ EN CAMINO!</p>
            <p style="margin:0 0 24px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888888;">HOLA ${nombre.toUpperCase()} — TU GUÍA YA FUE GENERADA</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5;">
              <tr><td style="padding:12px 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888888;">NÚMERO DE GUÍA</td></tr>
              <tr><td style="padding:0 0 4px;font-size:20px;font-weight:900;letter-spacing:2px;color:#003625;">${order.trackingNumber}</td></tr>
              ${order.carrier ? `<tr><td style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:1px;">PAQUETERÍA: ${order.carrier.toUpperCase()}</td></tr>` : ''}
              ${etaRow}
              ${order.trackingUrl ? `
              <tr><td style="padding:16px 0 0;">
                <a href="${order.trackingUrl}" style="display:inline-block;background:#003625;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:12px 24px;text-decoration:none;border-radius:4px;">
                  RASTREAR MI PAQUETE →
                </a>
              </td></tr>` : ''}
            </table>
            <p style="margin:24px 0 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888888;line-height:1.8;">
              DUDAS: @CASCARITAJC EN INSTAGRAM<br>
              <span style="color:#003625;font-weight:700;">PEDIDO #${shortId}</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#003625;padding:16px 36px;text-align:center;">
            <p style="margin:0;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7ab99a;">
              CASCARITAJC.COM &nbsp;·&nbsp; CONTACTO@CASCARITAJC.COM
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: `"La Cascarita Jersey Club" <${process.env.GMAIL_USER}>`,
    to: order.email,
    subject: `¡Tu paquete está en camino! 📦 Guía #${order.trackingNumber}`,
    html,
  })
}

// ─── EMAIL: CAMBIO DE STATUS ─────────────────────────────────────────────────

const STATUS_MESSAGES: Record<string, { title: string; body: string; emoji: string }> = {
  PROCESSING: { emoji: '⚙️', title: 'ESTAMOS PREPARANDO TU PEDIDO', body: 'Tu caja ya está en preparación. Pronto recibirás tu guía de rastreo.' },
  SHIPPED:    { emoji: '🚚', title: 'TU PEDIDO FUE ENVIADO',         body: 'Tu paquete salió y está en camino. Revisa tu guía para rastrearlo.' },
  DELIVERED:  { emoji: '✅', title: '¡TU PEDIDO FUE ENTREGADO!',     body: '¡Ya tienes tu caja! Esperamos que te encante tu jersey.' },
  CANCELLED:  { emoji: '❌', title: 'TU PEDIDO FUE CANCELADO',       body: 'Tu pedido fue cancelado. Escríbenos si tienes dudas o necesitas ayuda.' },
}

type StatusEmailData = {
  orderId: string
  email: string
  shippingName: string | null
  status: string
  trackingNumber?: string | null
  trackingUrl?: string | null
}

export async function sendStatusEmail(order: StatusEmailData) {
  const msg = STATUS_MESSAGES[order.status]
  if (!msg) return
  const nombre = order.shippingName?.split(' ')[0] ?? 'Cliente'
  const shortId = order.orderId.slice(-8).toUpperCase()

  const trackingRow = order.trackingNumber
    ? `<tr><td style="padding:16px 0 0;">
        <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888888;">GUÍA DE RASTREO</p>
        <p style="margin:0;font-size:16px;font-weight:900;letter-spacing:2px;color:#003625;">${order.trackingNumber}</p>
        ${order.trackingUrl ? `<a href="${order.trackingUrl}" style="display:inline-block;margin-top:10px;background:#003625;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:10px 20px;text-decoration:none;border-radius:4px;">RASTREAR →</a>` : ''}
      </td></tr>`
    : ''

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#E9E2C5;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#E9E2C5;padding:48px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#003625;padding:32px 36px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#ffffff;font-family:'Courier New',Courier,monospace;">LA CASCARITA</p>
            <p style="margin:6px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7ab99a;font-family:'Courier New',Courier,monospace;">JERSEY CLUB</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="20" style="background:#E9E2C5;border-radius:0 20px 20px 0;height:24px;"></td>
              <td style="border-top:2px dashed #c8bfa0;height:24px;"></td>
              <td width="20" style="background:#E9E2C5;border-radius:20px 0 0 20px;height:24px;"></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px 36px;">
            <p style="margin:0 0 4px;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;color:#0a0a0a;">${msg.title}</p>
            <p style="margin:0 0 24px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888888;">HOLA ${nombre.toUpperCase()}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5;">
              <tr><td style="padding:16px 0;font-size:12px;color:#444444;line-height:1.8;letter-spacing:0.5px;text-transform:uppercase;">${msg.body}</td></tr>
              ${trackingRow}
            </table>
            <p style="margin:24px 0 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888888;line-height:1.8;">
              DUDAS: @CASCARITAJC EN INSTAGRAM<br>
              <span style="color:#003625;font-weight:700;">PEDIDO #${shortId}</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#003625;padding:16px 36px;text-align:center;">
            <p style="margin:0;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7ab99a;">
              CASCARITAJC.COM &nbsp;·&nbsp; CONTACTO@CASCARITAJC.COM
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: `"La Cascarita Jersey Club" <${process.env.GMAIL_USER}>`,
    to: order.email,
    subject: `${msg.emoji} ${msg.title} · La Cascarita #${shortId}`,
    html,
  })
}
