import { Router, Request, Response } from 'express';
import { z } from 'zod';
import twilio from 'twilio';
import { env } from '../config/env.js';
import { supabaseServiceClient } from '../services/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

// Purchase a phone number
const purchaseBody = z.object({
  areaCode: z.string().length(3).optional(),
  country: z.string().default('US')
});

router.post('/purchase', async (req: AuthRequest, res: Response) => {
  const parsed = purchaseBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { areaCode, country } = parsed.data;
  const userId = req.userId!;

  try {
    const areaCodeNum = areaCode ? parseInt(areaCode, 10) : undefined;
    const availableNumbers = await twilioClient.availablePhoneNumbers(country)
      .local.list(areaCodeNum ? { areaCode: areaCodeNum, limit: 1 } : { limit: 1 });

    if (availableNumbers.length === 0) {
      return res.status(404).json({ error: 'No numbers available for this area code' });
    }

    const number = availableNumbers[0];
    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: number.phoneNumber,
      voiceUrl: `${env.APP_BASE_URL}/webhook/twilio/voice`,
      voiceMethod: 'POST',
      statusCallback: `${env.APP_BASE_URL}/webhook/twilio/status`,
      statusCallbackMethod: 'POST'
    });

    // Store in DB
    const { data, error } = await supabaseServiceClient.from('phone_numbers').insert({
      user_id: userId,
      phone_e164: purchased.phoneNumber,
      twilio_sid: purchased.sid
    }).select().single();

    if (error) {
      // Rollback: release the number
      await twilioClient.incomingPhoneNumbers(purchased.sid).remove();
      return res.status(500).json({ error: error.message });
    }

    res.json({ number: data, twilioSid: purchased.sid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Release a phone number
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const { data: number, error: fetchErr } = await supabaseServiceClient
    .from('phone_numbers')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !number) return res.status(404).json({ error: 'Number not found' });

  try {
    if (number.twilio_sid) {
      await twilioClient.incomingPhoneNumbers(number.twilio_sid).remove();
    }
    await supabaseServiceClient.from('phone_numbers').delete().eq('id', id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List user's numbers
router.get('/', async (_req: AuthRequest, res: Response) => {
  const userId = _req.userId!;
  const { data, error } = await supabaseServiceClient
    .from('phone_numbers')
    .select('*')
    .eq('user_id', userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ numbers: data });
});

// Update number configuration
router.patch('/:id/config', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const { voiceUrl, statusCallback } = req.body;

  const { data: number, error: fetchErr } = await supabaseServiceClient
    .from('phone_numbers')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !number) return res.status(404).json({ error: 'Number not found' });

  try {
    if (number.twilio_sid) {
      await twilioClient.incomingPhoneNumbers(number.twilio_sid).update({
        voiceUrl: voiceUrl || `${env.APP_BASE_URL}/webhook/twilio/voice`,
        statusCallback: statusCallback || `${env.APP_BASE_URL}/webhook/twilio/status`
      });
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
