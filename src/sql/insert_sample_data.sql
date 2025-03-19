
-- Sample data insertion script
-- Run this to populate tables with test data for development purposes

-- Insert sample communication provider
INSERT INTO public.communication_providers (id, user_id, name, type, is_default, config)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', 'Twilio Demo Provider', 'twilio', true, '{"accountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "authToken": "sample_token", "twilioNumber": "+15551234567"}'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'CallRail Demo Provider', 'callrail', false, '{"apiKey": "sample_api_key", "accountId": "sample_account_id"}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample properties
INSERT INTO public.properties (id, user_id, address, city, state, zip, price, bedrooms, bathrooms, square_feet, property_type, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', '123 Main St', 'Austin', 'TX', '78701', 450000, 3, 2.5, 2200, 'Single Family', 'Active'),
  ('00000000-0000-0000-0000-000000000002', 'system', '456 Oak Ave', 'Austin', 'TX', '78704', 375000, 2, 2, 1800, 'Condo', 'Active'),
  ('00000000-0000-0000-0000-000000000003', 'system', '789 Pine Ln', 'Dallas', 'TX', '75201', 550000, 4, 3, 3000, 'Single Family', 'Pending')
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO public.leads (id, user_id, first_name, last_name, email, phone, lead_type, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', 'John', 'Doe', 'john.doe@example.com', '+15551234567', 'buyer', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'Jane', 'Smith', 'jane.smith@example.com', '+15559876543', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'system', 'Robert', 'Johnson', 'robert.j@example.com', '+15555551212', 'buyer', 'new')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lists
INSERT INTO public.lists (id, user_id, name, description, type)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', 'Hot Prospects', 'High-priority buyer leads', 'leads'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'New Listings', 'Recently added properties', 'properties')
ON CONFLICT (id) DO NOTHING;

-- Insert sample list items
INSERT INTO public.list_items (id, list_id, item_id, item_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'lead'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'property')
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaigns
INSERT INTO public.campaigns (id, user_id, name, description, status, type, start_date, created_by)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', 'Spring Sellers Campaign', 'Target campaign for spring property listings', 'active', 'seller', NOW() - INTERVAL '30 days', 'system'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'First-Time Buyers', 'Campaign targeting first-time home buyers', 'active', 'buyer', NOW() - INTERVAL '15 days', 'system')
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaign leads
INSERT INTO public.campaign_leads (id, campaign_id, lead_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample call records
INSERT INTO public.call_records (id, user_id, provider_id, provider_type, call_id, phone_number, contact_name, timestamp, duration, notes, lead_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', '00000000-0000-0000-0000-000000000001', 'twilio', 'CA123456789', '+15551234567', 'John Doe', NOW() - INTERVAL '2 days', 120, 'Sample call record', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'system', '00000000-0000-0000-0000-000000000001', 'twilio', 'CA987654321', '+15559876543', 'Jane Smith', NOW() - INTERVAL '1 day', 180, 'Follow-up call', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Insert sample SMS records
INSERT INTO public.sms_records (id, user_id, provider_id, sms_id, phone_number, contact_name, timestamp, message, direction, lead_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', '00000000-0000-0000-0000-000000000001', 'SM123456789', '+15551234567', 'John Doe', NOW() - INTERVAL '2 days', 'Hello, this is a sample SMS message!', 'outgoing', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'system', '00000000-0000-0000-0000-000000000001', 'SM987654321', '+15551234567', 'John Doe', NOW() - INTERVAL '2 days', 'Thank you for your message.', 'incoming', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample documents
INSERT INTO public.documents (id, user_id, name, file_path, file_type, related_to_id, related_to_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', 'Purchase Agreement', '/documents/sample-contract.pdf', 'application/pdf', '00000000-0000-0000-0000-000000000001', 'lead'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'Property Photos', '/documents/property-images.zip', 'application/zip', '00000000-0000-0000-0000-000000000001', 'property')
ON CONFLICT (id) DO NOTHING;

-- Insert sample phone numbers
INSERT INTO public.phone_numbers (id, user_id, phone_number, provider_id, label, is_primary, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', '+15551234567', '00000000-0000-0000-0000-000000000001', 'Main Office', true, 'active'),
  ('00000000-0000-0000-0000-000000000002', 'system', '+15559876543', '00000000-0000-0000-0000-000000000001', 'Sales Team', false, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample contracts
INSERT INTO public.contracts (id, user_id, title, contract_type, status, property_id, buyer_id, seller_id, amount)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', 'Purchase Agreement - 123 Main St', 'purchase', 'pending', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 450000),
  ('00000000-0000-0000-0000-000000000002', 'system', 'Listing Agreement - 456 Oak Ave', 'listing', 'active', '00000000-0000-0000-0000-000000000002', null, '00000000-0000-0000-0000-000000000002', 375000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample letter records
INSERT INTO public.letter_records (id, user_id, recipient, address, timestamp, content, status, lead_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system', 'John Doe', '123 Main St, Anytown, USA', NOW() - INTERVAL '5 days', 'Dear Mr. Doe, this is a sample letter content...', 'sent', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'system', 'Jane Smith', '456 Oak St, Othertown, USA', NOW() - INTERVAL '2 days', 'Dear Ms. Smith, we are writing to inform you...', 'draft', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
