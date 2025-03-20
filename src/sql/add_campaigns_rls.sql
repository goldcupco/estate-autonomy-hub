
-- Add Row Level Security Policies for the campaigns table

-- Enable RLS on campaigns table if not already enabled
ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;

-- Users can view campaigns they created or are assigned to
CREATE POLICY IF NOT EXISTS "Users can view own campaigns" 
ON public.campaigns FOR SELECT 
USING (
  auth.uid()::text = user_id OR 
  auth.uid()::text = created_by OR
  auth.uid()::text = ANY(assigned_users)
);

-- Users can insert campaigns with their user_id
CREATE POLICY IF NOT EXISTS "Users can create own campaigns" 
ON public.campaigns FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can update campaigns they created
CREATE POLICY IF NOT EXISTS "Users can update own campaigns" 
ON public.campaigns FOR UPDATE 
USING (auth.uid()::text = user_id OR auth.uid()::text = created_by);

-- Users can delete campaigns they created
CREATE POLICY IF NOT EXISTS "Users can delete own campaigns" 
ON public.campaigns FOR DELETE 
USING (auth.uid()::text = user_id OR auth.uid()::text = created_by);
