import fetch from 'node-fetch';
import { supabaseServiceClient } from '../services/supabase.js';
import { transcribeAudioFromBuffer, summarizeTranscript } from '../services/ai.js';

const AUDIO_BUCKET = 'audio';

export async function processTwilioRecording(callSid: string, recordingUrl: string) {
  // Twilio recording URL needs extension to get media (e.g., .mp3)
  const mediaUrl = recordingUrl.endsWith('.mp3') ? recordingUrl : `${recordingUrl}.mp3`;

  const response = await fetch(mediaUrl);
  if (!response.ok) throw new Error(`Failed to fetch recording: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());

  const { data: callRow, error: callErr } = await supabaseServiceClient
    .from('calls').select('id').eq('twilio_call_sid', callSid).single();
  if (callErr) throw callErr;
  if (!callRow) throw new Error('Call not found');

  const storagePath = `call_${callRow.id}/${Date.now()}_recording.mp3`;
  const { error: uploadErr } = await supabaseServiceClient.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, buffer, { contentType: 'audio/mpeg', upsert: true });
  if (uploadErr) throw uploadErr;

  await supabaseServiceClient.from('audio_files').insert({
    call_id: callRow.id,
    storage_path: storagePath,
    content_type: 'audio/mpeg'
  });

  const transcription = await transcribeAudioFromBuffer(buffer, 'recording.mp3');
  const transcriptText = (transcription as any).text || (transcription as any).segments?.map((s: any) => s.text).join(' ') || '';

  const summary = await summarizeTranscript(transcriptText);

  await supabaseServiceClient.from('transcripts').insert({
    call_id: callRow.id,
    transcript: transcriptText,
    summary: summary,
    action_items: null,
    language: (transcription as any).language || null
  });
}

export default processTwilioRecording;

