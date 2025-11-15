import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabaseUserClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
export const supabaseServiceClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

