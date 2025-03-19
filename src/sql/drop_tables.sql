
-- WARNING: This script will drop all application tables and their data
-- Only use in development or when you need to completely reset the database

DROP TABLE IF EXISTS public.letter_records;
DROP TABLE IF EXISTS public.sms_records;
DROP TABLE IF EXISTS public.call_records;
DROP TABLE IF EXISTS public.communication_providers;
