import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8080),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  TWILIO_ACCOUNT_SID: z.string().min(10),
  TWILIO_AUTH_TOKEN: z.string().min(10),
  TWILIO_NUMBER_SID: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  OPENAI_API_KEY: z.string().min(10),
  ELEVENLABS_API_KEY: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APNS_KEY_ID: z.string().optional(),
  APNS_TEAM_ID: z.string().optional(),
  APNS_BUNDLE_ID: z.string().optional(),
  APP_BASE_URL: z.string().url().default('http://localhost:8080'),
  AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE: z.coerce.boolean().default(true),
  DEFAULT_PHONE_COUNTRY: z.string().default('US')
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsed.data;

