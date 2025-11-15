# 🎯 Setup Checklist - Voice AI Backend

## ✅ What's Complete (Code)

- ✅ All API endpoints implemented
- ✅ Authentication (email/password + Apple Sign-In)
- ✅ Phone number management (purchase/release)
- ✅ Agent configuration
- ✅ Business hours
- ✅ Call history & transcripts
- ✅ Voicemail flow (recording → transcription → summary)
- ✅ Device registration for push
- ✅ StoreKit receipt validation
- ✅ Daily recap
- ✅ Database schema
- ✅ Auth middleware
- ✅ Twilio webhooks (voicemail mode working)

---

## 📋 Supabase Setup Checklist

### 1. Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Sign up / Log in
- [ ] Click "New Project"
- [ ] Fill in:
  - Project name: `voice-ai-backend`
  - Database password: (save this securely)
  - Region: Choose closest to you
- [ ] Wait ~2 minutes for project to provision

### 2. Get API Keys
- [ ] Go to **Settings** → **API**
- [ ] Copy these values:
  - `Project URL` → `SUPABASE_URL` in `.env`
  - `anon public` key → `SUPABASE_ANON_KEY` in `.env`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` in `.env`
  - ⚠️ **Never share service_role key publicly!**

### 3. Run Database Schema
- [ ] Go to **SQL Editor** in Supabase dashboard
- [ ] Click **New Query**
- [ ] Open `supabase/schema.sql` from your project
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click **Run** (or press `Cmd/Ctrl + Enter`)
- [ ] Verify tables created:
  - `user_profiles`
  - `phone_numbers`
  - `calls`
  - `audio_files`
  - `transcripts`
  - `meeting_requests`
  - `agent_configs`
  - `business_hours`
  - `devices`
  - `subscriptions`

### 4. Create Storage Bucket
- [ ] Go to **Storage** in Supabase dashboard
- [ ] Click **New bucket**
- [ ] Name: `audio`
- [ ] Public bucket: **Yes** (or **No** if you want signed URLs)
- [ ] Click **Create bucket**
- [ ] (Optional) Create `transcripts` bucket for future use

### 5. Configure Authentication
- [ ] Go to **Authentication** → **Providers**
- [ ] **Email**: Enabled by default ✅
- [ ] **Apple**: 
  - [ ] Enable Apple provider
  - [ ] Add Apple Service ID
  - [ ] Add Apple Team ID
  - [ ] Add Apple Key ID
  - [ ] Upload Apple private key
  - [ ] Add callback URL: `https://<your-project>.supabase.co/auth/v1/callback`
- [ ] **Settings** → **Auth**:
  - [ ] Site URL: Your app URL (or `http://localhost:3000` for dev)
  - [ ] Redirect URLs: Add your app URLs

### 6. Enable Row Level Security (Optional)
- [ ] Go to **Authentication** → **Policies**
- [ ] For each table, create policies:
  - Users can only read/write their own data
  - Example for `calls` table:
    ```sql
    CREATE POLICY "Users can view own calls"
    ON calls FOR SELECT
    USING (auth.uid() = user_id);
    ```

### 7. Test Database Connection
- [ ] Run your backend: `npm run dev`
- [ ] Test: `POST http://localhost:8080/register`
  ```json
  {
    "email": "test@example.com",
    "password": "test123456"
  }
  ```
- [ ] Check Supabase **Authentication** → **Users** to see new user
- [ ] Check **Table Editor** → `user_profiles` to see profile

---

## 📞 Twilio Setup Checklist

### 1. Create Twilio Account
- [ ] Go to https://www.twilio.com
- [ ] Sign up / Log in
- [ ] Verify phone number (for trial account)
- [ ] Complete account setup

### 2. Get API Credentials
- [ ] Go to **Console** → **Account** → **API Keys & Tokens**
- [ ] Copy:
  - `Account SID` → `TWILIO_ACCOUNT_SID` in `.env`
  - `Auth Token` → `TWILIO_AUTH_TOKEN` in `.env`
  - ⚠️ **Never share Auth Token publicly!**

### 3. Purchase Phone Number (Optional - for testing)
- [ ] Go to **Phone Numbers** → **Buy a Number**
- [ ] Select:
  - Country: `United States` (or your country)
  - Capabilities: Check **Voice**
  - Click **Search**
- [ ] Choose a number and click **Buy**
- [ ] Note the number (E.164 format, e.g., `+15551234567`)
- [ ] Add to `.env`: `TWILIO_PHONE_NUMBER=+15551234567`

### 4. Configure Webhooks (After Deployment)

**For Local Development (using ngrok):**
- [ ] Install ngrok: `npm install -g ngrok` or download from https://ngrok.com
- [ ] Run: `ngrok http 8080`
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
- [ ] Use this URL in webhook config below

**In Twilio Console:**
- [ ] Go to **Phone Numbers** → **Manage** → **Active Numbers**
- [ ] Click your phone number
- [ ] Scroll to **Voice & Fax** section
- [ ] Configure:
  - **A Call Comes In**:
    - Webhook: `https://<your-deployed-url>/webhook/twilio/voice`
    - Method: `POST`
  - **Status Callback URL**:
    - Webhook: `https://<your-deployed-url>/webhook/twilio/status`
    - Method: `POST`
  - **Status Callback Events**: Check all (completed, failed, etc.)
- [ ] Click **Save**

### 5. Configure Recording (Optional)
- [ ] In **Phone Numbers** → **Voice & Fax**
- [ ] **Recording** → **Record calls**: Enabled
- [ ] **Recording Status Callback URL**:
  - `https://<your-deployed-url>/webhook/twilio/recording`
  - Method: `POST`

### 6. Test Incoming Call
- [ ] Call your Twilio number
- [ ] Should hear voicemail prompt (if `?mode=voicemail`) or AI greeting
- [ ] Leave a voicemail (if voicemail mode)
- [ ] Check backend logs for webhook calls
- [ ] Check Supabase `calls` table for new call record
- [ ] Check `transcripts` table after processing (takes ~30 seconds)

### 7. Enable Media Streams (For Real-Time AI - Advanced)
- [ ] Go to **Runtime** → **Functions** (if using Twilio Functions)
- [ ] Or use your backend WebSocket endpoint
- [ ] **Note**: Full Media Streams implementation requires WebSocket server
- [ ] For now, voicemail mode works without this

---

## 🔑 API Keys & Environment Variables

### Required Keys
- [ ] `SUPABASE_URL` - From Supabase Settings → API
- [ ] `SUPABASE_ANON_KEY` - From Supabase Settings → API
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Settings → API
- [ ] `TWILIO_ACCOUNT_SID` - From Twilio Console
- [ ] `TWILIO_AUTH_TOKEN` - From Twilio Console
- [ ] `OPENAI_API_KEY` - From https://platform.openai.com/api-keys

### Optional Keys (For Advanced Features)
- [ ] `ELEVENLABS_API_KEY` - For TTS (get from https://elevenlabs.io)
- [ ] `APPLE_TEAM_ID` - For StoreKit validation (Apple Developer)
- [ ] `APPLE_KEY_ID` - For StoreKit validation
- [ ] `APPLE_PRIVATE_KEY` - For StoreKit validation
- [ ] `APNS_KEY_ID` - For push notifications (Apple Developer)
- [ ] `APNS_TEAM_ID` - For push notifications
- [ ] `APNS_BUNDLE_ID` - Your iOS app bundle ID (e.g., `com.yourapp.voiceai`)

---

## 🚀 Deployment Checklist

### Before Deploying

1. **Environment Variables**
   - [ ] Create `.env` file with all required keys
   - [ ] **Never commit `.env` to Git** (add to `.gitignore`)
   - [ ] Set environment variables in your hosting platform

2. **Database**
   - [ ] Run `supabase/schema.sql` in Supabase SQL Editor
   - [ ] Create storage bucket `audio`
   - [ ] Test database connection locally

3. **Build**
   - [ ] Run `npm install`
   - [ ] Run `npm run build`
   - [ ] Test locally: `npm run dev`
   - [ ] Verify health check: `GET http://localhost:8080/health`

### Deployment Options

**Option 1: Render (Recommended)**
- [ ] Create account at https://render.com
- [ ] New **Web Service**
- [ ] Connect GitHub repo
- [ ] Settings:
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
  - Environment: `Node`
- [ ] Add all environment variables
- [ ] Deploy

**Option 2: Railway**
- [ ] Create account at https://railway.app
- [ ] New Project → Deploy from GitHub
- [ ] Add environment variables
- [ ] Deploy

**Option 3: Vercel (For Serverless)**
- [ ] Create account at https://vercel.com
- [ ] Import project
- [ ] Configure as Node.js project
- [ ] Add environment variables
- [ ] ⚠️ Note: May have timeout issues with long-running webhooks

**Option 4: AWS/Azure/GCP**
- [ ] Set up EC2/App Service/Cloud Run
- [ ] Install Node.js
- [ ] Deploy code
- [ ] Configure environment variables
- [ ] Set up reverse proxy (nginx) if needed

### After Deployment

1. **Update Webhooks**
   - [ ] Update Twilio webhook URLs to production URL
   - [ ] Test incoming call

2. **Test Endpoints**
   - [ ] `GET https://<your-url>/health`
   - [ ] `POST https://<your-url>/register`
   - [ ] `POST https://<your-url>/login`
   - [ ] `GET https://<your-url>/calls` (with auth token)

3. **Monitor**
   - [ ] Check logs for errors
   - [ ] Monitor Supabase dashboard for data
   - [ ] Monitor Twilio console for call logs

---

## 🧪 Testing Checklist

### Local Testing

1. **Start Server**
   ```bash
   npm install
   npm run dev
   ```

2. **Test Auth**
   - [ ] `POST http://localhost:8080/register`
   - [ ] `POST http://localhost:8080/login`
   - [ ] Save `access_token` from response

3. **Test Protected Endpoints**
   - [ ] `GET http://localhost:8080/calls` (with `Authorization: Bearer <token>`)
   - [ ] `POST http://localhost:8080/numbers/purchase` (with token)
   - [ ] `GET http://localhost:8080/agent` (with token)

4. **Test Twilio Webhook (Local)**
   - [ ] Start ngrok: `ngrok http 8080`
   - [ ] Update Twilio webhook to ngrok URL
   - [ ] Call your Twilio number
   - [ ] Check backend logs
   - [ ] Check Supabase tables

### Production Testing

- [ ] Register test user
- [ ] Purchase test phone number
- [ ] Make test call
- [ ] Verify call appears in `/calls`
- [ ] Verify transcript generated
- [ ] Test agent configuration
- [ ] Test business hours
- [ ] Test push notification (if APNs configured)

---

## ⚠️ Known Incomplete Features

### 1. Real-Time Media Streams (WebSocket)
- **Status**: Placeholder implementation
- **What's missing**: WebSocket server for Twilio Media Streams
- **Workaround**: Use voicemail mode (`?mode=voicemail`)
- **To implement**: 
  - Install `express-ws` or set up separate WebSocket server
  - Connect Twilio Media Streams WebSocket
  - Process audio chunks in real-time
  - Stream TTS audio back to Twilio

### 2. Text-to-Speech (TTS)
- **Status**: Uses Twilio `<Say>` (basic TTS)
- **What's missing**: ElevenLabs or OpenAI TTS integration
- **Workaround**: Current implementation works but limited voice options
- **To implement**:
  - Add ElevenLabs API integration
  - Convert AI response text to audio
  - Stream audio to Twilio

### 3. APNs Push Notifications
- **Status**: Code ready, needs Apple Developer setup
- **What's missing**: APNs key file and proper configuration
- **To implement**:
  - Generate APNs key from Apple Developer portal
  - Upload key file or set as environment variable
  - Configure bundle ID
  - Test with real device

### 4. Apple Sign-In
- **Status**: Endpoint ready, needs Supabase Apple provider config
- **What's missing**: Apple Service ID, Team ID, Key ID setup in Supabase
- **To implement**: Follow Supabase Apple provider setup guide

---

## 📝 Quick Start Commands

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your keys

# Run database schema in Supabase SQL Editor
# Copy contents of supabase/schema.sql

# Start development server
npm run build
npm run dev

# Test health
curl http://localhost:8080/health

# Test registration
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## 🆘 Troubleshooting

### Supabase Issues
- **"Relation does not exist"**: Run `supabase/schema.sql` again
- **"Invalid API key"**: Check you're using correct keys from Settings → API
- **"Storage bucket not found"**: Create `audio` bucket in Storage

### Twilio Issues
- **"Webhook not receiving calls"**: Check webhook URL is correct and accessible
- **"Recording not processing"**: Check `TWILIO_AUTH_TOKEN` is correct
- **"Number not found"**: Ensure number is purchased and linked to webhook

### Backend Issues
- **"Cannot find module"**: Run `npm install`
- **"Port already in use"**: Change `PORT` in `.env`
- **"Environment validation failed"**: Check all required env vars are set

---

## ✅ Completion Status

**Backend Code**: ✅ **100% Complete** (except real-time Media Streams)

**Setup Required**:
- [ ] Supabase project + schema
- [ ] Twilio account + webhooks
- [ ] API keys in `.env`
- [ ] Deployment

**Optional (Advanced)**:
- [ ] Real-time Media Streams WebSocket
- [ ] ElevenLabs TTS
- [ ] APNs push notifications
- [ ] Apple Sign-In provider

---

**Next Steps**: Start with Supabase setup, then Twilio, then test locally, then deploy! 🚀

