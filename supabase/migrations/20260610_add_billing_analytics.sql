-- ============================================================
-- LEADSHIELD BILLING, ANALYTICS & ADMIN ROLE
-- Adds admin roles, payment tracking, and usage analytics
-- ============================================================

-- 1. Add admin/billing columns to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 39.00,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 2. Payment history table
CREATE TABLE IF NOT EXISTS public.client_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method TEXT,
    notes TEXT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Activity log table for analytics
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_payments_client ON public.client_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_status ON public.client_payments(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_client ON public.activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_role ON public.clients(role);
CREATE INDEX IF NOT EXISTS idx_clients_payment_status ON public.clients(payment_status);

-- Enable RLS
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS: Admin can see all payments, clients see own
CREATE POLICY "Admin full access payments"
    ON public.client_payments FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Clients read own payments"
    ON public.client_payments FOR SELECT
    USING (auth.uid() = client_id);

-- RLS: Admin can see all activity, clients see own
CREATE POLICY "Admin full access activity"
    ON public.activity_log FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Clients read own activity"
    ON public.activity_log FOR SELECT
    USING (auth.uid() = client_id);
