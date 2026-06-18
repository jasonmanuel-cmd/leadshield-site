type SquarePaymentLinkInput = {
  amount: number
  name: string
  buyerEmail?: string | null
  description?: string | null
  redirectUrl?: string | null
}

export type SquarePaymentLink = {
  id: string
  url: string
  longUrl: string | null
  orderId: string | null
}

export function isSquareConfigured() {
  return !!(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID)
}

export async function createSquarePaymentLink(input: SquarePaymentLinkInput): Promise<SquarePaymentLink> {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!accessToken || !locationId) {
    throw new Error('Square is not configured')
  }

  const environment = (process.env.SQUARE_ENVIRONMENT || 'production').toLowerCase()
  const baseUrl = environment === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com'
  const amountCents = Math.round(input.amount * 100)

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error('Payment amount must be greater than zero')
  }

  const res = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': '2026-05-20',
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      description: input.description || input.name,
      quick_pay: {
        name: input.name,
        price_money: {
          amount: amountCents,
          currency: 'USD',
        },
        location_id: locationId,
      },
      checkout_options: input.redirectUrl ? {
        redirect_url: input.redirectUrl,
      } : undefined,
      pre_populated_data: input.buyerEmail ? {
        buyer_email: input.buyerEmail,
      } : undefined,
      payment_note: input.description || input.name,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    const message = data?.errors?.[0]?.detail || data?.errors?.[0]?.code || 'Square payment link failed'
    throw new Error(message)
  }

  const link = data.payment_link
  if (!link?.id || !link?.url) {
    throw new Error('Square did not return a payment link')
  }

  return {
    id: link.id,
    url: link.url,
    longUrl: link.long_url ?? null,
    orderId: link.order_id ?? null,
  }
}
