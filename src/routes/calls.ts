import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseServiceClient } from '../services/supabase.js';
import { transcribeAudioFromBuffer, summarizeTranscript } from '../services/ai.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { data, error } = await supabaseServiceClient
    .from('calls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ calls: data });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { data: call, error: callErr } = await supabaseServiceClient
    .from('calls').select('*').eq('id', id).single();
  if (callErr) return res.status(404).json({ error: callErr.message });
  const { data: transcript } = await supabaseServiceClient
    .from('transcripts').select('*').eq('call_id', id).maybeSingle();
  const { data: audios } = await supabaseServiceClient
    .from('audio_files').select('*').eq('call_id', id);
  res.json({ call, transcript, audioFiles: audios ?? [] });
});

const summarizeBody = z.object({ transcript: z.string().min(1) });
router.post('/summarize-call', async (req: AuthRequest, res: Response) => {
  const parsed = summarizeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const summary = await summarizeTranscript(parsed.data.transcript);
  res.json({ summary });
});

router.post('/upload-audio', async (req: AuthRequest, res: Response) => {
  // Expect base64 audio for simplicity
  const bodySchema = z.object({ callId: z.string().uuid(), base64: z.string() });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { callId, base64 } = parsed.data;
  const buffer = Buffer.from(base64, 'base64');
  const transcript = await transcribeAudioFromBuffer(buffer, 'upload.mp3');
  const text = (transcript as any).text || '';
  const summary = await summarizeTranscript(text);
  await supabaseServiceClient.from('transcripts').insert({ call_id: callId, transcript: text, summary });
  res.json({ ok: true, text, summary });
});

export default router;

