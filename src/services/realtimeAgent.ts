import WebSocket from 'ws';
import OpenAI from 'openai';
import { env } from '../config/env.js';
import { supabaseServiceClient } from './supabase.js';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface CallSession {
  callSid: string;
  userId: string;
  agentConfig: any;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  ws?: WebSocket;
}

const activeSessions = new Map<string, CallSession>();

export async function handleRealtimeCall(callSid: string, fromNumber: string, toNumber: string) {
  // Find which user owns this number
  const { data: number } = await supabaseServiceClient
    .from('phone_numbers')
    .select('user_id')
    .eq('phone_e164', toNumber)
    .single();

  if (!number) throw new Error('Number not found');

  // Get agent config
  const { data: agentConfig } = await supabaseServiceClient
    .from('agent_configs')
    .select('*')
    .eq('user_id', number.user_id)
    .eq('is_active', true)
    .maybeSingle();

  const session: CallSession = {
    callSid,
    userId: number.user_id,
    agentConfig: agentConfig || {
      greeting_text: 'Hello, thank you for calling. How can I help you today?',
      persona_prompt: 'You are a polite AI receptionist. Greet callers warmly and note their reason for calling.'
    },
    conversationHistory: []
  };

  activeSessions.set(callSid, session);

  // Create call record
  await supabaseServiceClient.from('calls').insert({
    twilio_call_sid: callSid,
    user_id: number.user_id,
    from_number: fromNumber,
    to_number: toNumber,
    status: 'in-progress',
    started_at: new Date().toISOString()
  });

  return session;
}

export function getSession(callSid: string): CallSession | undefined {
  return activeSessions.get(callSid);
}

export async function processUserMessage(callSid: string, audioBase64: string): Promise<string> {
  const session = activeSessions.get(callSid);
  if (!session) throw new Error('Session not found');

  // Convert base64 to buffer and transcribe
  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const transcription = await openai.audio.transcriptions.create({
    file: audioBuffer as any,
    model: 'whisper-1'
  });

  const userText = (transcription as any).text || '';
  session.conversationHistory.push({ role: 'user', content: userText });

  // Generate AI response
  const systemPrompt = session.agentConfig.persona_prompt ||
    'You are a polite AI receptionist. Greet callers warmly, note their reason for calling, and ask if they need a callback.';

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...session.conversationHistory.slice(-10) // Last 10 messages
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages as any,
    temperature: 0.7
  });

  const assistantText = completion.choices[0]?.message?.content || 'I apologize, I did not understand that.';
  session.conversationHistory.push({ role: 'assistant', content: assistantText });

  // TODO: Convert text to speech using ElevenLabs or OpenAI TTS
  // For now, return text (Twilio can use <Say> with this)
  return assistantText;
}

export function endSession(callSid: string) {
  activeSessions.delete(callSid);
}
