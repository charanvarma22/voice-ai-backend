import { Router, Response } from 'express';
import { supabaseServiceClient } from '../services/supabase.js';
import { sendPushNotification } from '../services/push.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

// Generate daily recap and send push notification
router.post('/recap/daily', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's calls
  const { data: calls, error: callsErr } = await supabaseServiceClient
    .from('calls')
    .select('*, transcripts(summary, action_items)')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  if (callsErr) return res.status(400).json({ error: callsErr.message });

  const totalCalls = calls?.length || 0;
  const missedCalls = calls?.filter(c => c.status === 'no-answer' || c.status === 'busy').length || 0;
  const actionItems: string[] = [];

  calls?.forEach(call => {
    const transcript = (call.transcripts as any)?.[0];
    if (transcript?.action_items) {
      const items = Array.isArray(transcript.action_items) 
        ? transcript.action_items 
        : JSON.parse(transcript.action_items || '[]');
      actionItems.push(...items);
    }
  });

  const recap = {
    date: today.toISOString().split('T')[0],
    totalCalls,
    missedCalls,
    actionItems: [...new Set(actionItems)],
    calls: calls?.map(c => ({
      id: c.id,
      from: c.from_number,
      status: c.status,
      summary: (c.transcripts as any)?.[0]?.summary
    }))
  };

  // Send push notification
  await sendPushNotification(
    userId,
    `Daily Recap: ${totalCalls} calls today`,
    `You had ${totalCalls} calls, ${missedCalls} missed. ${actionItems.length} action items.`
  );

  res.json({ recap });
});

export default router;
