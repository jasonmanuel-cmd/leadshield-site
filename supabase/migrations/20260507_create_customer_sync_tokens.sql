-- Create customer_sync_tokens table for per-user Android sync authentication
CREATE TABLE IF NOT EXISTS public.customer_sync_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_token TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'operator', 'voice', 'team', 'master')),
  device_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP,
  CONSTRAINT unique_user_active_token UNIQUE (user_id, is_active) WHERE is_active = true
);

-- Enable Row Level Security
ALTER TABLE public.customer_sync_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own sync tokens
CREATE POLICY "Users can read their own sync tokens"
  ON public.customer_sync_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all tokens (for internal operations)
CREATE POLICY "Service role can manage sync tokens"
  ON public.customer_sync_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for fast lookups
CREATE INDEX idx_customer_sync_tokens_token ON public.customer_sync_tokens(sync_token);
CREATE INDEX idx_customer_sync_tokens_user_id ON public.customer_sync_tokens(user_id);
CREATE INDEX idx_customer_sync_tokens_active ON public.customer_sync_tokens(is_active) WHERE is_active = true;
