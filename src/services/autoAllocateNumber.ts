import twilio from 'twilio';
import { env } from '../config/env.js';
import { supabaseServiceClient } from './supabase.js';

const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/**
 * Automatically allocate a phone number for a new subscriber
 * Only allocates if user doesn't already have a number
 */
export async function autoAllocateNumberForUser(
  userId: string,
  options?: { areaCode?: string; country?: string }
): Promise<{ success: boolean; number?: any; error?: string }> {
  try {
    // Check if user already has a number
    const { data: existingNumbers } = await supabaseServiceClient
      .from('phone_numbers')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingNumbers && existingNumbers.length > 0) {
      return { success: false, error: 'User already has a phone number' };
    }

    // Get available numbers
    const country = options?.country || 'US';
    const areaCode = options?.areaCode;

    const availableNumbers = await twilioClient.availablePhoneNumbers(country)
      .local.list({ areaCode, limit: 1 });

    if (availableNumbers.length === 0) {
      // Try without area code if area code search failed
      const fallbackNumbers = await twilioClient.availablePhoneNumbers(country)
        .local.list({ limit: 1 });
      
      if (fallbackNumbers.length === 0) {
        return { success: false, error: 'No phone numbers available' };
      }

      const number = fallbackNumbers[0];
      return await purchaseAndStoreNumber(userId, number);
    }

    const number = availableNumbers[0];
    return await purchaseAndStoreNumber(userId, number);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function purchaseAndStoreNumber(userId: string, availableNumber: any) {
  try {
    // Purchase the number
    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: availableNumber.phoneNumber,
      voiceUrl: `${env.APP_BASE_URL}/webhook/twilio/voice`,
      voiceMethod: 'POST',
      statusCallback: `${env.APP_BASE_URL}/webhook/twilio/status`,
      statusCallbackMethod: 'POST'
    });

    // Store in database
    const { data, error } = await supabaseServiceClient
      .from('phone_numbers')
      .insert({
        user_id: userId,
        phone_e164: purchased.phoneNumber,
        twilio_sid: purchased.sid,
        label: 'Auto-allocated'
      })
      .select()
      .single();

    if (error) {
      // Rollback: release the number if DB insert fails
      try {
        await twilioClient.incomingPhoneNumbers(purchased.sid).remove();
      } catch (rollbackErr) {
        // Log but don't throw - the number is already purchased
        console.error('Failed to rollback number purchase:', rollbackErr);
      }
      return { success: false, error: error.message };
    }

    return { success: true, number: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

