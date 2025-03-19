
-- Main tables creation script
-- Run this script to create all required tables for the application

-- Communication Providers Table
CREATE TABLE IF NOT EXISTS public.communication_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Records Table
CREATE TABLE IF NOT EXISTS public.call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  call_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Records Table
CREATE TABLE IF NOT EXISTS public.sms_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  sms_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  message TEXT NOT NULL,
  direction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Letter Records Table
CREATE TABLE IF NOT EXISTS public.letter_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL,
  status TEXT NOT NULL,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communication_providers_user_id ON public.communication_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_providers_type ON public.communication_providers(type);
CREATE INDEX IF NOT EXISTS idx_call_records_user_id ON public.call_records(user_id);
CREATE INDEX IF NOT EXISTS idx_call_records_phone_number ON public.call_records(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_records_user_id ON public.sms_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_records_phone_number ON public.sms_records(phone_number);
CREATE INDEX IF NOT EXISTS idx_letter_records_user_id ON public.letter_records(user_id);
CREATE INDEX IF NOT EXISTS idx_letter_records_status ON public.letter_records(status);
