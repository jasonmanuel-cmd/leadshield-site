import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * Generate and store a unique sync token for a customer upgrading to OPERATOR tier or above.
 * Called after successful payment/subscription activation.
 *
 * @param userId - The authenticated user's ID (from Supabase auth)
 * @param tier - Subscription tier ('operator', 'voice', 'team', 'master')
 * @param deviceId - Optional device ID for device-specific tokens
 * @returns The generated sync token
 */
export async function generateSyncTokenForCustomer(
  userId: string,
  tier: 'pro' | 'operator' | 'voice' | 'team' | 'master',
  deviceId?: string
): Promise<string> {
  // Generate cryptographically secure token
  const syncToken = crypto.randomBytes(32).toString('hex')

  // Initialize Supabase service role client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // First, deactivate any existing active tokens for this user
  // (enforces single active token per user)
  await supabase
    .from('customer_sync_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)

  // Insert new active token
  const { data, error } = await supabase
    .from('customer_sync_tokens')
    .insert({
      user_id: userId,
      sync_token: syncToken,
      tier: tier,
      device_id: deviceId || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to generate sync token: ${error.message}`)
  }

  console.log(
    `✅ Generated sync token for user ${userId}, tier: ${tier}${deviceId ? `, device: ${deviceId}` : ''}`
  )

  return syncToken
}

/**
 * Called when a subscription is upgraded from a lower tier to OPERATOR or above.
 * Generates a new sync token for the user.
 *
 * This should be called in your payment webhook handler (e.g., Stripe webhook, Google Play webhook).
 *
 * @example
 * // In your webhook handler (Stripe, Google Play, etc)
 * const tier = event.subscription.tier; // 'operator', 'voice', etc.
 * if (shouldGenerateSyncToken(tier)) {
 *   const syncToken = await generateSyncTokenForCustomer(userId, tier, deviceId);
 *   // Optionally send token to user via email, SMS, or return in API response
 * }
 */
export function shouldGenerateSyncToken(tier: string): boolean {
  const OPERATOR_TIER_ID = 2
  const TIER_IDS: Record<string, number> = {
    'pro': 1,
    'operator': 2,
    'voice': 4,
    'team': 5,
    'master': 3,
  }

  const tierId = TIER_IDS[tier] || 0
  return tierId >= OPERATOR_TIER_ID
}

/**
 * Revoke a user's sync token (e.g., when subscription is cancelled or downgraded).
 *
 * @param userId - The user's ID
 */
export async function revokeSyncTokenForCustomer(userId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { error } = await supabase
    .from('customer_sync_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    throw new Error(`Failed to revoke sync token: ${error.message}`)
  }

  console.log(`✅ Revoked sync token for user ${userId}`)
}

/**
 * Get a user's current active sync token (for debugging/admin purposes).
 *
 * @param userId - The user's ID
 * @returns The sync token or null if not found
 */
export async function getSyncTokenForCustomer(userId: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data, error } = await supabase
    .from('customer_sync_tokens')
    .select('sync_token')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data.sync_token
}
