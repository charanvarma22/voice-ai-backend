-- Users profile (maps to auth.users via user_id)
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  business_name text,
  phone_number text,
  time_zone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure moddatetime (updated_at);

-- Twilio numbers owned by user
create table if not exists public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_e164 text not null,
  twilio_sid text,
  label text,
  created_at timestamptz default now()
);
create index if not exists idx_phone_numbers_user on public.phone_numbers(user_id);

-- Calls metadata
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  from_number text,
  to_number text,
  twilio_call_sid text,
  status text,
  duration_seconds integer,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_calls_user on public.calls(user_id);
create index if not exists idx_calls_twilio_sid on public.calls(twilio_call_sid);

-- Audio files
create table if not exists public.audio_files (
  id uuid primary key default gen_random_uuid(),
  call_id uuid references public.calls(id) on delete cascade,
  storage_path text not null,
  content_type text,
  duration_seconds integer,
  created_at timestamptz default now()
);
create index if not exists idx_audio_call on public.audio_files(call_id);

-- Transcripts and AI summaries
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  call_id uuid references public.calls(id) on delete cascade,
  transcript text,
  summary text,
  action_items jsonb,
  language text,
  created_at timestamptz default now()
);
create index if not exists idx_transcripts_call on public.transcripts(call_id);

-- Meeting requests (optional)
create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  call_id uuid references public.calls(id) on delete set null,
  title text,
  notes text,
  suggested_time timestamptz,
  status text default 'pending',
  created_at timestamptz default now()
);
create index if not exists idx_meeting_user on public.meeting_requests(user_id);

-- Agent configurations (voice, persona, greeting)
create table if not exists public.agent_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Default Agent',
  voice_provider text default 'elevenlabs', -- elevenlabs, openai, etc
  voice_id text,
  persona_prompt text,
  greeting_text text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_agent_configs_user on public.agent_configs(user_id);

-- Business hours configuration
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timezone text default 'UTC',
  monday_enabled boolean default true,
  monday_start time,
  monday_end time,
  tuesday_enabled boolean default true,
  tuesday_start time,
  tuesday_end time,
  wednesday_enabled boolean default true,
  wednesday_start time,
  wednesday_end time,
  thursday_enabled boolean default true,
  thursday_start time,
  thursday_end time,
  friday_enabled boolean default true,
  friday_start time,
  friday_end time,
  saturday_enabled boolean default false,
  saturday_start time,
  saturday_end time,
  sunday_enabled boolean default false,
  sunday_start time,
  sunday_end time,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_business_hours_user on public.business_hours(user_id);

-- Device tokens for push notifications
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_token text not null,
  platform text not null, -- ios, android
  app_version text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, device_token)
);
create index if not exists idx_devices_user on public.devices(user_id);

-- Subscriptions (StoreKit receipts)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null, -- free, pro, business
  store_kit_receipt text,
  store_kit_transaction_id text,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_active on public.subscriptions(user_id, is_active) where is_active = true;

