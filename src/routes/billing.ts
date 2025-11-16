import { Router, Response } from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';
import { supabaseServiceClient } from '../services/supabase.js';
import { env } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';
import { autoAllocateNumberForUser } from '../services/autoAllocateNumber.js';

const router = Router();

const validateReceiptBody = z.object({
  receipt_data: z.string().min(10),
  transaction_id: z.string().optional(),
  areaCode: z.string().length(3).optional(), // Optional: preferred area code for auto-allocation
  country: z.string().optional() // Optional: country for auto-allocation (default: US)
});

// StoreKit receipt validation
router.post('/validate', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const parsed = validateReceiptBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    // Validate with Apple App Store
    const sandboxUrl = 'https://sandbox.itunes.apple.com/verifyReceipt';
    const prodUrl = 'https://buy.itunes.apple.com/verifyReceipt';
    
    const response = await fetch(sandboxUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': parsed.data.receipt_data,
        password: env.APPLE_PRIVATE_KEY || '' // App-specific shared secret
      })
    });

    const result = await response.json() as any;

    if (result.status !== 0) {
      // Try production
      const prodResponse = await fetch(prodUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'receipt-data': parsed.data.receipt_data,
          password: env.APPLE_PRIVATE_KEY || ''
        })
      });
      const prodResult = await prodResponse.json() as any;
      if (prodResult.status !== 0) {
        return res.status(400).json({ error: 'Invalid receipt', status: prodResult.status });
      }
      Object.assign(result, prodResult);
    }

    // Extract subscription info
    const latestReceipt = result.latest_receipt_info?.[0];
    const expiresAt = latestReceipt?.expires_date_ms
      ? new Date(parseInt(latestReceipt.expires_date_ms))
      : null;

    // Determine plan from product_id
    const productId = latestReceipt?.product_id || '';
    let planName = 'free';
    if (productId.includes('pro')) planName = 'pro';
    else if (productId.includes('business')) planName = 'business';

    // Check if this is a new subscription (user upgrading from free)
    const { data: existingSub } = await supabaseServiceClient
      .from('subscriptions')
      .select('plan_name, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    const isNewSubscription = !existingSub || !existingSub.is_active || existingSub.plan_name === 'free';
    const isUpgradeToPaid = planName !== 'free' && isNewSubscription;

    // Store subscription
    const { data, error } = await supabaseServiceClient
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_name: planName,
        store_kit_receipt: parsed.data.receipt_data,
        store_kit_transaction_id: parsed.data.transaction_id || latestReceipt?.transaction_id,
        expires_at: expiresAt,
        is_active: expiresAt ? expiresAt > new Date() : false
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Auto-allocate phone number for new paid subscribers
    let allocatedNumber = null;
    if (isUpgradeToPaid && env.AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE) {
      const allocationResult = await autoAllocateNumberForUser(userId, {
        areaCode: parsed.data.areaCode,
        country: parsed.data.country || env.DEFAULT_PHONE_COUNTRY
      });

      if (allocationResult.success) {
        allocatedNumber = allocationResult.number;
      } else {
        // Log but don't fail the subscription - number allocation is best-effort
        console.warn(`Failed to auto-allocate number for user ${userId}:`, allocationResult.error);
      }
    }

    res.json({
      subscription: data,
      validated: true,
      numberAllocated: isUpgradeToPaid,
      phoneNumber: allocatedNumber ? {
        id: allocatedNumber.id,
        phone_e164: allocatedNumber.phone_e164,
        twilio_sid: allocatedNumber.twilio_sid
      } : null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get user subscription
router.get('/subscription', async (_req: AuthRequest, res: Response) => {
  const userId = _req.userId!;
  const { data, error } = await supabaseServiceClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ subscription: data || { plan_name: 'free', is_active: true } });
});

export default router;
