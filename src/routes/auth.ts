import { Router } from 'express';
import { z } from 'zod';
import { supabaseUserClient } from '../services/supabase.js';

const router = Router();

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  businessName: z.string().optional(),
  phoneNumber: z.string().optional(),
  timeZone: z.string().optional()
});

router.post('/register', async (req, res) => {
  const parsed = registerBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, name, businessName, phoneNumber, timeZone } = parsed.data;

  const { data, error } = await supabaseUserClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        business_name: businessName,
        phone_number: phoneNumber,
        time_zone: timeZone
      }
    }
  });

  if (error) return res.status(400).json({ error: error.message });
  return res.json({ user: data.user, session: data.session });
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  const parsed = loginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const { data, error } = await supabaseUserClient.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  return res.json({ user: data.user, session: data.session });
});

// Apple Sign-In (requires Supabase Apple provider configured)
const appleSignInBody = z.object({
  id_token: z.string().min(10)
});

router.post('/auth/apple', async (req, res) => {
  const parsed = appleSignInBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseUserClient.auth.signInWithIdToken({
    provider: 'apple',
    token: parsed.data.id_token
  });

  if (error) return res.status(401).json({ error: error.message });
  return res.json({ user: data.user, session: data.session });
});

export default router;

