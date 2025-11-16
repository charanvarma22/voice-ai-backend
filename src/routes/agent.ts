import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseServiceClient } from '../services/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

const agentConfigBody = z.object({
  name: z.string().optional(),
  voice_provider: z.enum(['elevenlabs', 'openai']).optional(),
  voice_id: z.string().optional(),
  persona_prompt: z.string().optional(),
  greeting_text: z.string().optional(),
  is_active: z.boolean().optional()
});

// Get active agent config
router.get('/', async (_req: AuthRequest, res: Response) => {
  const userId = _req.userId!;
  const { data, error } = await supabaseServiceClient
    .from('agent_configs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ agent: data });
});

// Create or update agent config
router.post('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const parsed = agentConfigBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Deactivate other agents if setting this one active
  if (parsed.data.is_active) {
    await supabaseServiceClient.from('agent_configs')
      .update({ is_active: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabaseServiceClient
    .from('agent_configs')
    .upsert({
      user_id: userId,
      ...parsed.data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ agent: data });
});

// Update agent config
router.patch('/agent/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const parsed = agentConfigBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (parsed.data.is_active) {
    await supabaseServiceClient.from('agent_configs')
      .update({ is_active: false })
      .eq('user_id', userId)
      .neq('id', id);
  }

  const { data, error } = await supabaseServiceClient
    .from('agent_configs')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ agent: data });
});

export default router;
