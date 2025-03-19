
-- WARNING: This script will drop all application tables and their data
-- Only use in development or when you need to completely reset the database

-- Drop junction tables first to avoid foreign key constraints
DROP TABLE IF EXISTS public.campaign_leads;
DROP TABLE IF EXISTS public.list_items;

-- Drop tables with foreign key dependencies
DROP TABLE IF EXISTS public.contracts;
DROP TABLE IF EXISTS public.phone_numbers;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.letter_records;
DROP TABLE IF EXISTS public.sms_records;
DROP TABLE IF EXISTS public.call_records;

-- Drop main entity tables
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.lists;
DROP TABLE IF EXISTS public.leads;
DROP TABLE IF EXISTS public.properties;
DROP TABLE IF EXISTS public.communication_providers;
