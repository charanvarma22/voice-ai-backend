import OpenAI from 'openai';
import { env } from '../config/env.js';
import { Readable } from 'stream';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function transcribeAudioFromBuffer(buffer: Buffer, filename: string) {
  const stream = Readable.from(buffer) as Readable & { name?: string };
  stream.name = filename;
  const response = await openai.audio.transcriptions.create({
    file: stream as any,
    model: 'whisper-1',
    response_format: 'verbose_json'
  } as any);
  return response;
}

export async function summarizeTranscript(transcriptText: string) {
  const system = 'You are an assistant that summarizes phone call voicemails. Produce: summary and action items.';
  const user = `Transcript:\n${transcriptText}`;
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.2
  });
  const content = result.choices[0]?.message?.content ?? '';
  return content;
}

