
-- Row Level Security (RLS) policies
-- Run this script to set up security policies for your tables

-- Enable Row Level Security on tables
ALTER TABLE public.communication_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_records ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own data (read policy)
CREATE POLICY "Users can view their own communication providers"
  ON public.communication_providers FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

CREATE POLICY "Users can view their own call records"
  ON public.call_records FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

CREATE POLICY "Users can view their own SMS records"
  ON public.sms_records FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

CREATE POLICY "Users can view their own letter records"
  ON public.letter_records FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own communication providers"
  ON public.communication_providers FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own call records"
  ON public.call_records FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own SMS records"
  ON public.sms_records FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own letter records"
  ON public.letter_records FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own communication providers"
  ON public.communication_providers FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own call records"
  ON public.call_records FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own SMS records"
  ON public.sms_records FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own letter records"
  ON public.letter_records FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own data
CREATE POLICY "Users can delete their own communication providers"
  ON public.communication_providers FOR DELETE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own call records"
  ON public.call_records FOR DELETE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own SMS records"
  ON public.sms_records FOR DELETE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own letter records"
  ON public.letter_records FOR DELETE
  USING (auth.uid()::text = user_id);
