
// This file would be deployed as a Supabase Edge Function

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Twilio } from 'https://esm.sh/twilio@4.19.3'

interface RequestBody {
  userId: string;
  providerId: string;
  phoneNumber: string;
  message: string;
  contactName?: string;
}

serve(async (req) => {
  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { userId, providerId, phoneNumber, message, contactName } = await req.json() as RequestBody

    // Get the provider configuration from the database
    const { data: providerData, error: providerError } = await supabaseClient
      .from('communication_providers')
      .select('*')
      .eq('id', providerId)
      .eq('user_id', userId)
      .single()

    if (providerError) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (providerData.type !== 'twilio') {
      return new Response(JSON.stringify({ error: 'Only Twilio providers support SMS' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get Twilio credentials
    const accountSid = providerData.config.accountSid
    const authToken = providerData.config.authToken
    const twilioNumber = providerData.config.twilioNumber

    // Initialize Twilio client
    const twilio = new Twilio(accountSid, authToken)

    // Send the SMS
    const twilioMessage = await twilio.messages.create({
      body: message,
      to: phoneNumber,
      from: twilioNumber
    })

    return new Response(JSON.stringify({ 
      success: true,
      smsId: twilioMessage.sid
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
