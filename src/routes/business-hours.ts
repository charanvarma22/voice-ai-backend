import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseServiceClient } from '../services/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

const dayConfig = z.object({
  enabled: z.boolean(),
  start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end: z.string().regex(/^\d{2}:\d{2}$/).optional()
});

const businessHoursBody = z.object({
  timezone: z.string().optional(),
  monday: dayConfig.optional(),
  tuesday: dayConfig.optional(),
  wednesday: dayConfig.optional(),
  thursday: dayConfig.optional(),
  friday: dayConfig.optional(),
  saturday: dayConfig.optional(),
  sunday: dayConfig.optional()
});

// Get business hours
router.get('/', async (_req: AuthRequest, res: Response) => {
  const userId = _req.userId!;
  const { data, error } = await supabaseServiceClient
    .from('business_hours')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ businessHours: data });
});

// Create or update business hours
router.post('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const parsed = businessHoursBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const update: any = { user_id: userId };
  if (parsed.data.timezone) update.timezone = parsed.data.timezone;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of days) {
    const dayData = parsed.data[day as keyof typeof parsed.data];
    if (dayData && typeof dayData === 'object' && 'enabled' in dayData) {
      update[`${day}_enabled`] = dayData.enabled;
      update[`${day}_start`] = dayData.start || null;
      update[`${day}_end`] = dayData.end || null;
    }
  }

  const { data, error } = await supabaseServiceClient
    .from('business_hours')
    .upsert(update, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ businessHours: data });
});

export default router;
