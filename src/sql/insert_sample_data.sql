
-- Sample data insertion script
-- Run this to populate tables with test data for development purposes

-- Insert sample communication provider
INSERT INTO public.communication_providers (id, user_id, name, type, is_default, config)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', 'Twilio Demo Provider', 'twilio', true, '{"accountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "authToken": "sample_token", "twilioNumber": "+15551234567"}'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'CallRail Demo Provider', 'callrail', false, '{"apiKey": "sample_api_key", "accountId": "sample_account_id"}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample call records
INSERT INTO public.call_records (id, user_id, provider_id, provider_type, call_id, phone_number, contact_name, timestamp, duration, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', '00000000-0000-0000-0000-000000000001', 'twilio', 'CA123456789', '+15551234567', 'John Doe', NOW() - INTERVAL '2 days', 120, 'Sample call record'),
  ('00000000-0000-0000-0000-000000000002', 'system', '00000000-0000-0000-0000-000000000001', 'twilio', 'CA987654321', '+15559876543', 'Jane Smith', NOW() - INTERVAL '1 day', 180, 'Follow-up call')
ON CONFLICT (id) DO NOTHING;

-- Insert sample SMS records
INSERT INTO public.sms_records (id, user_id, provider_id, sms_id, phone_number, contact_name, timestamp, message, direction)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', '00000000-0000-0000-0000-000000000001', 'SM123456789', '+15551234567', 'John Doe', NOW() - INTERVAL '2 days', 'Hello, this is a sample SMS message!', 'outgoing'),
  ('00000000-0000-0000-0000-000000000002', 'system', '00000000-0000-0000-0000-000000000001', 'SM987654321', '+15551234567', 'John Doe', NOW() - INTERVAL '2 days', 'Thank you for your message.', 'incoming')
ON CONFLICT (id) DO NOTHING;

-- Insert sample letter records
INSERT INTO public.letter_records (id, user_id, recipient, address, timestamp, content, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', 'John Doe', '123 Main St, Anytown, USA', NOW() - INTERVAL '5 days', 'Dear Mr. Doe, this is a sample letter content...', 'sent'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'Jane Smith', '456 Oak St, Othertown, USA', NOW() - INTERVAL '2 days', 'Dear Ms. Smith, we are writing to inform you...', 'draft')
ON CONFLICT (id) DO NOTHING;
