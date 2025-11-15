import { Router } from 'express';
import twilio from 'twilio';
import { env } from '../config/env.js';
import { supabaseServiceClient } from '../services/supabase.js';
import processTwilioRecording from '../workflows/processRecording.js';
import { handleRealtimeCall, getSession } from '../services/realtimeAgent.js';

const router = Router();

// Incoming voice webhook: AI agent or voicemail
router.post('/webhook/twilio/voice', async (req, res) => {
  const { From, To, CallSid } = req.body || {};
  const voiceResponse = new twilio.twiml.VoiceResponse();

  // Check if user wants AI agent (default) or voicemail
  // For now, use AI agent. To switch to voicemail, set ?mode=voicemail
  const mode = req.query.mode || 'agent';

  if (mode === 'voicemail') {
    // Voicemail mode
    const recordAction = '/webhook/twilio/recording';
    voiceResponse.say({ voice: 'Polly.Joanna' }, 'Please leave your message after the beep.');
    voiceResponse.record({
      action: recordAction,
      method: 'POST',
      maxLength: 300,
      playBeep: true,
      trim: 'do-not-trim',
      recordingStatusCallback: recordAction,
      recordingStatusCallbackMethod: 'POST'
    });
    voiceResponse.hangup();
  } else {
    // AI Agent mode - use Media Streams for real-time
    try {
      const session = await handleRealtimeCall(CallSid, From, To);
      const greeting = session.agentConfig?.greeting_text || 'Hello, thank you for calling. How can I help you today?';

      voiceResponse.say({ voice: 'Polly.Joanna' }, greeting);

      // Start Media Stream to WebSocket for real-time AI
      const streamUrl = `${env.APP_BASE_URL}/webhook/twilio/media/${CallSid}`;
      voiceResponse.start().stream({
        url: streamUrl,
        name: CallSid
      });

      voiceResponse.say({ voice: 'Polly.Joanna' }, 'You are now connected to our AI assistant.');
    } catch (err: any) {
      // Fallback to voicemail on error
      voiceResponse.say({ voice: 'Polly.Joanna' }, 'I apologize, but I cannot connect you right now. Please leave a message.');
      voiceResponse.record({
        action: '/webhook/twilio/recording',
        method: 'POST',
        maxLength: 300
      });
    }
  }

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// Media Stream WebSocket endpoint (for real-time AI)
// Note: This requires a WebSocket server, which Express doesn't handle natively
// You'll need to set up a separate WebSocket server or use a library like 'express-ws'
// For now, this is a placeholder
router.post('/webhook/twilio/media/:callSid', async (req, res) => {
  // This endpoint would handle WebSocket connections from Twilio Media Streams
  // Implementation requires express-ws or a separate WebSocket server
  res.status(501).json({ error: 'Media Streams not yet implemented - use voicemail mode' });
});

// Recording status callback: Twilio sends recording URL and CallSid
router.post('/webhook/twilio/recording', async (req, res) => {
  const { RecordingUrl, RecordingSid, CallSid, From, To, RecordingDuration } = req.body || {};

  // Create a call record if not present
  await supabaseServiceClient.from('calls').upsert({
    twilio_call_sid: CallSid,
    from_number: From,
    to_number: To,
    status: 'recorded',
    duration_seconds: RecordingDuration ? Number(RecordingDuration) : null
  }, { onConflict: 'twilio_call_sid' });

  // Store audio file row with temporary external URL; a worker will fetch and store
  const { data: callRow } = await supabaseServiceClient.from('calls').select('id').eq('twilio_call_sid', CallSid).single();
  if (callRow) {
    await supabaseServiceClient.from('audio_files').insert({
      call_id: callRow.id,
      storage_path: RecordingUrl,
      content_type: 'audio/mpeg'
    });

    // Fire-and-forget processing (no await to keep webhook fast)
    processTwilioRecording(CallSid, RecordingUrl).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Recording processing failed', err);
    });
  }

  res.status(200).json({ ok: true });
});

// Call status callback
router.post('/webhook/twilio/status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body || {};

  if (CallStatus === 'completed' || CallStatus === 'no-answer' || CallStatus === 'busy') {
    await supabaseServiceClient.from('calls')
      .update({
        status: CallStatus,
        duration_seconds: CallDuration ? Number(CallDuration) : null,
        ended_at: new Date().toISOString()
      })
      .eq('twilio_call_sid', CallSid);
  }

  res.status(200).json({ ok: true });
});

export default router;

