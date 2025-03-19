
-- Row Level Security (RLS) policies
-- Run this script to set up security policies for your tables

-- Enable Row Level Security on all tables
ALTER TABLE public.communication_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_records ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own data (read policy)
-- Communication Providers
CREATE POLICY "Users can view their own communication providers"
  ON public.communication_providers FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Properties
CREATE POLICY "Users can view their own properties"
  ON public.properties FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Leads
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Lists
CREATE POLICY "Users can view their own lists"
  ON public.lists FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- List Items
CREATE POLICY "Users can view their own list items"
  ON public.list_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lists
    WHERE public.lists.id = public.list_items.list_id
    AND (auth.uid()::text = public.lists.user_id OR public.lists.user_id = 'system')
  ));

-- Campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Campaign Leads
CREATE POLICY "Users can view their own campaign leads"
  ON public.campaign_leads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE public.campaigns.id = public.campaign_leads.campaign_id
    AND (auth.uid()::text = public.campaigns.user_id OR public.campaigns.user_id = 'system')
  ));

-- Call Records
CREATE POLICY "Users can view their own call records"
  ON public.call_records FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- SMS Records
CREATE POLICY "Users can view their own SMS records"
  ON public.sms_records FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Documents
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Phone Numbers
CREATE POLICY "Users can view their own phone numbers"
  ON public.phone_numbers FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Contracts
CREATE POLICY "Users can view their own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Letter Records
CREATE POLICY "Users can view their own letter records"
  ON public.letter_records FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'system');

-- Allow users to insert their own data
-- Communication Providers
CREATE POLICY "Users can insert their own communication providers"
  ON public.communication_providers FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Properties
CREATE POLICY "Users can insert their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Leads
CREATE POLICY "Users can insert their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Lists
CREATE POLICY "Users can insert their own lists"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- List Items
CREATE POLICY "Users can insert into their own lists"
  ON public.list_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.lists
    WHERE public.lists.id = public.list_items.list_id
    AND auth.uid()::text = public.lists.user_id
  ));

-- Campaigns
CREATE POLICY "Users can insert their own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Campaign Leads
CREATE POLICY "Users can insert into their own campaigns"
  ON public.campaign_leads FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE public.campaigns.id = public.campaign_leads.campaign_id
    AND auth.uid()::text = public.campaigns.user_id
  ));

-- Call Records
CREATE POLICY "Users can insert their own call records"
  ON public.call_records FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- SMS Records
CREATE POLICY "Users can insert their own SMS records"
  ON public.sms_records FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Documents
CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Phone Numbers
CREATE POLICY "Users can insert their own phone numbers"
  ON public.phone_numbers FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Contracts
CREATE POLICY "Users can insert their own contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Letter Records
CREATE POLICY "Users can insert their own letter records"
  ON public.letter_records FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own data
-- Communication Providers
CREATE POLICY "Users can update their own communication providers"
  ON public.communication_providers FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Properties
CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Leads
CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Lists
CREATE POLICY "Users can update their own lists"
  ON public.lists FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- List Items
CREATE POLICY "Users can update items in their own lists"
  ON public.list_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.lists
    WHERE public.lists.id = public.list_items.list_id
    AND auth.uid()::text = public.lists.user_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.lists
    WHERE public.lists.id = public.list_items.list_id
    AND auth.uid()::text = public.lists.user_id
  ));

-- Campaigns
CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Campaign Leads
CREATE POLICY "Users can update items in their own campaigns"
  ON public.campaign_leads FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE public.campaigns.id = public.campaign_leads.campaign_id
    AND auth.uid()::text = public.campaigns.user_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE public.campaigns.id = public.campaign_leads.campaign_id
    AND auth.uid()::text = public.campaigns.user_id
  ));

-- Call Records
CREATE POLICY "Users can update their own call records"
  ON public.call_records FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- SMS Records
CREATE POLICY "Users can update their own SMS records"
  ON public.sms_records FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Documents
CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Phone Numbers
CREATE POLICY "Users can update their own phone numbers"
  ON public.phone_numbers FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Contracts
CREATE POLICY "Users can update their own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Letter Records
CREATE POLICY "Users can update their own letter records"
  ON public.letter_records FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own data
-- Communication Providers
CREATE POLICY "Users can delete their own communication providers"
  ON public.communication_providers FOR DELETE
  USING (auth.uid()::text = user_id);

-- Properties
CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid()::text = user_id);

-- Leads
CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (auth.uid()::text = user_id);

-- Lists
CREATE POLICY "Users can delete their own lists"
  ON public.lists FOR DELETE
  USING (auth.uid()::text = user_id);

-- List Items
CREATE POLICY "Users can delete items from their own lists"
  ON public.list_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.lists
    WHERE public.lists.id = public.list_items.list_id
    AND auth.uid()::text = public.lists.user_id
  ));

-- Campaigns
CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid()::text = user_id);

-- Campaign Leads
CREATE POLICY "Users can delete items from their own campaigns"
  ON public.campaign_leads FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE public.campaigns.id = public.campaign_leads.campaign_id
    AND auth.uid()::text = public.campaigns.user_id
  ));

-- Call Records
CREATE POLICY "Users can delete their own call records"
  ON public.call_records FOR DELETE
  USING (auth.uid()::text = user_id);

-- SMS Records
CREATE POLICY "Users can delete their own SMS records"
  ON public.sms_records FOR DELETE
  USING (auth.uid()::text = user_id);

-- Documents
CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid()::text = user_id);

-- Phone Numbers
CREATE POLICY "Users can delete their own phone numbers"
  ON public.phone_numbers FOR DELETE
  USING (auth.uid()::text = user_id);

-- Contracts
CREATE POLICY "Users can delete their own contracts"
  ON public.contracts FOR DELETE
  USING (auth.uid()::text = user_id);

-- Letter Records
CREATE POLICY "Users can delete their own letter records"
  ON public.letter_records FOR DELETE
  USING (auth.uid()::text = user_id);
