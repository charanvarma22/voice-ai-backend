# ✅ Complete To-Do List - Voice AI Backend

## 📋 Phase 1: Environment Setup (15 minutes)

### Backend Environment
- [ ] Create `.env` file in project root
- [ ] Add Supabase credentials:
  - [ ] `SUPABASE_URL` (from Supabase Dashboard → Settings → API)
  - [ ] `SUPABASE_ANON_KEY` (anon public key)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (service_role secret key)
- [ ] Add Twilio credentials:
  - [ ] `TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID` ✅
  - [ ] `TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN` ✅
  - [ ] `TWILIO_PHONE_NUMBER=+12184141541` ✅
- [ ] Add OpenAI credentials:
  - [ ] `OPENAI_API_KEY` (from https://platform.openai.com/api-keys)
- [ ] Add server config:
  - [ ] `APP_BASE_URL=http://localhost:8080`
  - [ ] `PORT=8080`

### Install Dependencies
- [ ] Run `npm install` in project root
- [ ] Verify no errors in terminal
- [ ] Check `node_modules` folder exists

---

## 📋 Phase 2: Supabase Setup (10 minutes)

### Database Schema
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Run complete schema from `supabase/schema.sql`
- [ ] Verify all tables created:
  - [ ] `user_profiles`
  - [ ] `phone_numbers`
  - [ ] `calls`
  - [ ] `audio_files`
  - [ ] `transcripts`
  - [ ] `meeting_requests`
  - [ ] `agent_configs`
  - [ ] `business_hours`
  - [ ] `devices`
  - [ ] `subscriptions`

### Storage Bucket
- [ ] Go to Supabase Dashboard → Storage
- [ ] Create new bucket named `audio`
- [ ] Set Public bucket: **ON** (for MVP)
- [ ] Click "Create bucket"
- [ ] Verify bucket appears in list

### Row-Level Security (Optional but Recommended)
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Run RLS policies SQL (if not already done)
- [ ] Verify policies created in Table Editor → RLS policies

### Test Database Connection
- [ ] Start backend: `npm run dev`
- [ ] Test registration endpoint:
  ```bash
  curl -X POST http://localhost:8080/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123456"}'
  ```
- [ ] Check Supabase → Authentication → Users (should see new user)
- [ ] Check Supabase → Table Editor → `user_profiles` (should see profile)

---

## 📋 Phase 3: Twilio Setup (15 minutes)

### Get Twilio Credentials ✅ (Already Done)
- [x] Account SID: `YOUR_TWILIO_ACCOUNT_SID`
- [x] Auth Token: `YOUR_TWILIO_AUTH_TOKEN`
- [x] Phone Number: `+1 218 414 1541`

### Configure Webhooks (After Backend is Running)

#### Step 1: Start Backend
- [ ] Run `npm run dev` in terminal
- [ ] Verify: `API listening on http://localhost:8080`
- [ ] Test health: `curl http://localhost:8080/health`

#### Step 2: Start ngrok (for local testing)
- [ ] Open new terminal
- [ ] Run: `npx ngrok http 8080`
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
- [ ] Keep ngrok running

#### Step 3: Configure Twilio Webhooks
- [ ] Go to Twilio Console → Phone Numbers → Manage → Active Numbers
- [ ] Click on number: `+1 218 414 1541`
- [ ] Scroll to **Voice & Fax** section
- [ ] Configure **A Call Comes In**:
  - [ ] Webhook: `https://your-ngrok-url.ngrok.io/webhook/twilio/voice`
  - [ ] HTTP: `POST`
- [ ] Configure **Status Callback URL**:
  - [ ] URL: `https://your-ngrok-url.ngrok.io/webhook/twilio/status`
  - [ ] HTTP: `POST`
  - [ ] Status Callback Events: Check all (completed, failed, busy, no-answer)
- [ ] Configure **Recording Status Callback** (optional):
  - [ ] URL: `https://your-ngrok-url.ngrok.io/webhook/twilio/recording`
  - [ ] HTTP: `POST`
- [ ] Click **Save**

### Test Incoming Call
- [ ] Call `+1 218 414 1541` from your phone
- [ ] Should hear voicemail prompt or AI greeting
- [ ] Leave a voicemail message
- [ ] Check backend terminal logs (should see webhook calls)
- [ ] Check Supabase → Table Editor → `calls` (new row should appear)
- [ ] Wait 30-60 seconds, check `audio_files` and `transcripts` tables

---

## 📋 Phase 4: Backend Testing (20 minutes)

### Basic Endpoints
- [ ] **Health Check**
  ```bash
  curl http://localhost:8080/health
  ```
  Expected: `{"ok":true,"service":"voice-ai-backend"}`

- [ ] **Register User**
  ```bash
  curl -X POST http://localhost:8080/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123456","name":"Test User"}'
  ```
  - [ ] Save `access_token` from response
  - [ ] Verify user in Supabase

- [ ] **Login**
  ```bash
  curl -X POST http://localhost:8080/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123456"}'
  ```
  - [ ] Verify token returned

### Protected Endpoints (Use token from registration)
- [ ] **Get Calls**
  ```bash
  curl http://localhost:8080/calls \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```

- [ ] **Create Agent Config**
  ```bash
  curl -X POST http://localhost:8080/agent \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Default Agent","greeting_text":"Hello! How can I help?","is_active":true}'
  ```

- [ ] **Get Agent Config**
  ```bash
  curl http://localhost:8080/agent \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```

- [ ] **Set Business Hours**
  ```bash
  curl -X POST http://localhost:8080/business-hours \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"timezone":"America/New_York","monday":{"enabled":true,"start":"09:00","end":"17:00"}}'
  ```

- [ ] **Purchase Phone Number** (optional)
  ```bash
  curl -X POST http://localhost:8080/numbers/purchase \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"areaCode":"415","country":"US"}'
  ```

### Test Voicemail Flow End-to-End
- [ ] Make test call to Twilio number
- [ ] Leave voicemail
- [ ] Wait 30-60 seconds for processing
- [ ] Check `calls` table has new row
- [ ] Check `audio_files` table has new row
- [ ] Check `transcripts` table has transcript + summary
- [ ] Get call details via API:
  ```bash
  curl http://localhost:8080/call/CALL_ID \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```

---

## 📋 Phase 5: Deployment (30 minutes)

### Choose Hosting Platform
- [ ] **Option 1: Render** (Recommended)
  - [ ] Create account at https://render.com
  - [ ] New Web Service
  - [ ] Connect GitHub repo
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`
  - [ ] Add all environment variables
  - [ ] Deploy

- [ ] **Option 2: Railway**
  - [ ] Create account at https://railway.app
  - [ ] New Project → Deploy from GitHub
  - [ ] Add environment variables
  - [ ] Deploy

- [ ] **Option 3: AWS/Azure/GCP**
  - [ ] Set up EC2/App Service/Cloud Run
  - [ ] Install Node.js
  - [ ] Deploy code
  - [ ] Configure environment variables

### Update Twilio Webhooks to Production
- [ ] Get production URL (e.g., `https://your-app.onrender.com`)
- [ ] Go to Twilio → Phone Numbers → Your Number
- [ ] Update webhooks to production URL:
  - [ ] Voice webhook: `https://your-app.onrender.com/webhook/twilio/voice`
  - [ ] Status callback: `https://your-app.onrender.com/webhook/twilio/status`
  - [ ] Recording callback: `https://your-app.onrender.com/webhook/twilio/recording`
- [ ] Save

### Update Environment Variables
- [ ] Update `APP_BASE_URL` in production `.env` to production URL
- [ ] Verify all other env vars are set in hosting platform

### Test Production
- [ ] Test health: `curl https://your-app.onrender.com/health`
- [ ] Test registration: `curl -X POST https://your-app.onrender.com/register ...`
- [ ] Make test call to Twilio number
- [ ] Verify call processing works

---

## 📋 Phase 6: iOS Developer Handoff

### Documentation
- [ ] Share `API_DOCUMENTATION.md` with iOS developer
- [ ] Provide production API base URL
- [ ] Share test account credentials (optional)
- [ ] Explain authentication flow (Bearer token)

### Test Data
- [ ] Create test user account
- [ ] Make sample calls (for iOS dev to see data structure)
- [ ] Document sample API responses

### Environment Variables for iOS
- [ ] Provide `BACKEND_API_URL` (production URL)
- [ ] Provide `SUPABASE_URL` (if using client-side auth)
- [ ] Provide `SUPABASE_ANON_KEY` (if using client-side auth)
- [ ] **Never share** `SUPABASE_SERVICE_ROLE_KEY` or `TWILIO_AUTH_TOKEN`

---

## 📋 Phase 7: Optional Enhancements (Future)

### Real-Time AI Agent
- [ ] Install `express-ws` or set up WebSocket server
- [ ] Implement Twilio Media Streams WebSocket handler
- [ ] Integrate OpenAI Realtime API or Deepgram for streaming ASR
- [ ] Integrate ElevenLabs or OpenAI TTS for streaming audio
- [ ] Test real-time conversation flow

### Text-to-Speech (TTS)
- [ ] Get ElevenLabs API key
- [ ] Add `ELEVENLABS_API_KEY` to `.env`
- [ ] Implement TTS service in `src/services/ai.ts`
- [ ] Update `realtimeAgent.ts` to use TTS instead of Twilio `<Say>`

### Push Notifications (APNs)
- [ ] Generate APNs key from Apple Developer portal
- [ ] Add to `.env`:
  - [ ] `APNS_KEY_ID`
  - [ ] `APNS_TEAM_ID`
  - [ ] `APNS_BUNDLE_ID`
- [ ] Test push notification sending
- [ ] Test VoIP push for incoming calls

### Apple Sign-In
- [ ] Configure Apple provider in Supabase:
  - [ ] Go to Supabase → Authentication → Providers
  - [ ] Enable Apple
  - [ ] Add Apple Service ID, Team ID, Key ID
  - [ ] Upload Apple private key
- [ ] Test `POST /auth/apple` endpoint

### Additional Features
- [ ] Add call analytics dashboard
- [ ] Add webhook signature verification for Twilio
- [ ] Add rate limiting
- [ ] Add request logging/monitoring
- [ ] Add error tracking (Sentry, etc.)
- [ ] Add automated tests

---

## 🎯 Quick Start Checklist (Minimum to Get Running)

If you want to test ASAP, do these in order:

1. **Environment** (5 min)
   - [ ] Create `.env` with all keys
   - [ ] Run `npm install`

2. **Supabase** (5 min)
   - [ ] Run schema SQL
   - [ ] Create `audio` bucket

3. **Backend** (2 min)
   - [ ] Run `npm run dev`
   - [ ] Test `/health` endpoint

4. **Twilio** (10 min)
   - [ ] Start ngrok
   - [ ] Configure webhooks
   - [ ] Make test call

5. **Verify** (5 min)
   - [ ] Check Supabase tables have data
   - [ ] Test API endpoints

**Total: ~30 minutes to working MVP** 🚀

---

## 📝 Notes

- ✅ = Already completed
- [ ] = To do
- All times are estimates
- Test each phase before moving to next
- Keep ngrok running while testing locally
- Never commit `.env` file to Git

---

## 🆘 Troubleshooting

If you get stuck:
1. Check backend logs: `npm run dev` terminal
2. Check Supabase logs: Dashboard → Logs
3. Check Twilio logs: Console → Monitor → Logs
4. Verify all env vars are set correctly
5. Verify webhook URLs are accessible (use ngrok for local)

---

**Last Updated:** Now
**Status:** Ready to start Phase 1

