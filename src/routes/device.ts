import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseServiceClient } from '../services/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

const registerDeviceBody = z.object({
  device_token: z.string().min(10),
  platform: z.enum(['ios', 'android']),
  app_version: z.string().optional()
});

// Register device for push notifications
router.post('/device/register', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const parsed = registerDeviceBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseServiceClient
    .from('devices')
    .upsert({
      user_id: userId,
      device_token: parsed.data.device_token,
      platform: parsed.data.platform,
      app_version: parsed.data.app_version,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,device_token' })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ device: data });
});

// Unregister device
router.delete('/device/:token', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { token } = req.params;

  const { error } = await supabaseServiceClient
    .from('devices')
    .delete()
    .eq('user_id', userId)
    .eq('device_token', token);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
