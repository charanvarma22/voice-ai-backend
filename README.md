## Voice AI Backend (Node.js + Express + Supabase + Twilio)

### Quick start
1. Install Node 18+.
2. Install deps:
   ```bash
   npm install
   npm run dev
   ```
3. Health check: `GET http://localhost:8080/health`

### Environment variables
Create a `.env` file with the following:

```
PORT=8080
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_NUMBER_SID= (optional)
TWILIO_PHONE_NUMBER= (optional)
OPENAI_API_KEY=
ELEVENLABS_API_KEY= (optional, for TTS)
APPLE_TEAM_ID= (optional, for StoreKit)
APPLE_KEY_ID= (optional, for StoreKit)
APPLE_PRIVATE_KEY= (optional, for StoreKit)
APNS_KEY_ID= (optional, for push notifications)
APNS_TEAM_ID= (optional, for push notifications)
APNS_BUNDLE_ID= (optional, for push notifications)
APP_BASE_URL=http://localhost:8080
```

### Supabase setup
- Run SQL in `supabase/schema.sql` (SQL editor).
- Create Storage buckets: `audio` (public or with signed URLs). Optionally `transcripts`.

### Twilio webhook (voicemail flow)
- Set Voice webhook for your number to:
  - `POST https://<your-host>/webhook/twilio/voice`
  - Recording status callback auto-points to `/webhook/twilio/recording`.

### Core API endpoints

**Authentication:**
- `POST /register` - Create account
- `POST /login` - Sign in
- `POST /auth/apple` - Apple Sign-In

**Phone Numbers:**
- `POST /numbers/purchase` - Buy Twilio number
- `GET /numbers` - List numbers
- `DELETE /numbers/:id` - Release number
- `PATCH /numbers/:id/config` - Update webhooks

**Agent Configuration:**
- `GET /agent` - Get active agent
- `POST /agent` - Create/update agent
- `PATCH /agent/:id` - Update agent

**Business Hours:**
- `GET /business-hours` - Get config
- `POST /business-hours` - Set hours

**Calls:**
- `GET /calls` - List calls (requires auth)
- `GET /call/:id` - Call details + transcript
- `POST /summarize-call` - Generate summary
- `POST /upload-audio` - Upload audio

**Push Notifications:**
- `POST /device/register` - Register device token
- `DELETE /device/:token` - Unregister device

**Billing:**
- `POST /billing/validate` - Validate StoreKit receipt (auto-allocates phone number for new paid subscribers)
- `GET /billing/subscription` - Get subscription

**Recap:**
- `POST /recap/daily` - Generate daily recap

**Webhooks (Public):**
- `POST /webhook/twilio/voice` - Incoming call (use `?mode=voicemail` for voicemail)
- `POST /webhook/twilio/recording` - Recording callback
- `POST /webhook/twilio/status` - Call status

### Notes
- Uses OpenAI Whisper for transcription and GPT for summaries.
- Real-time AI agent mode (default) or voicemail mode (`?mode=voicemail`).
- All protected routes require `Authorization: Bearer <token>` header.
- See `API_DOCUMENTATION.md` for full endpoint reference.

