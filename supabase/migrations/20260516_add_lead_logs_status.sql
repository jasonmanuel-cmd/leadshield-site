-- Add pipeline status and metadata to lead_logs so clients can manage leads
ALTER TABLE public.lead_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new';
ALTER TABLE public.lead_logs ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE public.lead_logs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.lead_logs ADD COLUMN IF NOT EXISTS called_back_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.lead_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Clients can update their own lead status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients update own leads') THEN
    CREATE POLICY "Clients update own leads"
      ON public.lead_logs FOR UPDATE
      USING (auth.uid() = client_id)
      WITH CHECK (auth.uid() = client_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients insert own leads') THEN
    CREATE POLICY "Clients insert own leads"
      ON public.lead_logs FOR INSERT
      WITH CHECK (auth.uid() = client_id);
  END IF;
END;
$$;
