# 🚀 Step-by-Step: Deploy & Prepare for iOS Developer

## Overview
You need to:
1. Deploy backend to production (so iOS app can call it)
2. Test that it works
3. Configure Twilio webhooks
4. Create test account
5. Share everything with iOS dev

**Time**: ~1 hour
**Difficulty**: Easy (just follow steps)

---

## Part 1: Deploy Backend to Production

### Step 1.1: Choose Hosting Platform

**Where**: Your browser
**What**: Sign up for Render (easiest option)

1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

**Why Render?**
- Free tier available
- Easy setup
- Auto-deploys from GitHub
- Good for Node.js apps

---

### Step 1.2: Prepare Your Code (If Not on GitHub)

**Where**: Your computer
**What**: Make sure code is on GitHub

**Option A: Already on GitHub?**
- Skip to Step 1.3

**Option B: Not on GitHub?**
1. Go to: https://github.com
2. Sign in or create account
3. Click **"New repository"** (green button)
4. Name it: `voice-ai-backend` (or any name)
5. Click **"Create repository"**
6. Open terminal in your project folder (`C:\Users\kammi\OneDrive\Desktop\pp`)
7. Run these commands:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/voice-ai-backend.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### Step 1.3: Connect GitHub to Render

**Where**: Render dashboard
**What**: Link your GitHub account

1. In Render dashboard, click **"New"** → **"Web Service"**
2. Click **"Connect account"** next to GitHub
3. Authorize Render to access your repositories
4. Select your repository: `voice-ai-backend` (or whatever you named it)
5. Click **"Connect"**

---

### Step 1.4: Configure Web Service

**Where**: Render "Create a New Web Service" page
**What**: Set up your service

Fill in these fields:

**Name**: `voice-ai-backend` (or any name)

**Region**: Choose closest to you (e.g., `Oregon (US West)`)

**Branch**: `main` (or `master` if that's your branch)

**Root Directory**: Leave empty (code is in root)

**Environment**: Select **"Node"**

**Build Command**: 
```
npm install && npm run build
```

**Start Command**: 
```
npm start
```

**Note**: Make sure you have a `start` script in `package.json`. If not, we'll add it.

---

### Step 1.5: Add Environment Variables

**Where**: Same page, scroll down to "Environment Variables"
**What**: Add all your secrets

Click **"Add Environment Variable"** for each one:

1. **PORT** = `8080`
2. **SUPABASE_URL** = (your Supabase URL, e.g., `https://xxxxx.supabase.co`)
3. **SUPABASE_ANON_KEY** = (your Supabase anon key)
4. **SUPABASE_SERVICE_ROLE_KEY** = (your Supabase service role key)
5. **TWILIO_ACCOUNT_SID** = (your Twilio Account SID)
6. **TWILIO_AUTH_TOKEN** = (your Twilio Auth Token)
7. **OPENAI_API_KEY** = (your OpenAI API key)
8. **APP_BASE_URL** = `https://your-app-name.onrender.com` (you'll update this after deployment)
9. **AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE** = `true` (optional)
10. **DEFAULT_PHONE_COUNTRY** = `US` (optional)

**How to find these values:**
- **Supabase**: Go to Supabase Dashboard → Settings → API
- **Twilio**: Go to Twilio Console → Account → API Keys & Tokens
- **OpenAI**: Go to https://platform.openai.com/api-keys

**Important**: 
- Copy values from your local `.env` file
- Don't share these publicly
- Render keeps them secure

---

### Step 1.6: Check package.json Scripts

**Where**: Your project folder
**What**: Make sure you have a `start` script

Open `package.json` and check if you have:

```json
"scripts": {
  "start": "node dist/server.js",
  "build": "tsc",
  ...
}
```

**If you DON'T have `start` and `build` scripts:**

1. Open `package.json`
2. Find the `"scripts"` section
3. Add these if missing:

```json
"scripts": {
  "start": "node dist/server.js",
  "build": "tsc",
  "dev": "tsx watch src/server.ts"
}
```

4. Save the file
5. Commit and push to GitHub:
```bash
git add package.json
git commit -m "Add build and start scripts"
git push
```

---

### Step 1.7: Deploy

**Where**: Render dashboard
**What**: Start deployment

1. Scroll down on the "Create a New Web Service" page
2. Click **"Create Web Service"** (blue button at bottom)
3. Wait 5-10 minutes for deployment
4. Watch the logs - you'll see:
   - "Building..."
   - "Starting..."
   - "Your service is live at https://your-app-name.onrender.com"

**If deployment fails:**
- Check the logs (click "Logs" tab)
- Common issues:
  - Missing environment variable → Add it
  - Build error → Check `package.json` scripts
  - Port error → Make sure `PORT` env var is set

---

### Step 1.8: Get Your Production URL

**Where**: Render dashboard
**What**: Copy your URL

1. Once deployed, you'll see: **"Your service is live"**
2. Copy the URL: `https://your-app-name.onrender.com`
3. **Update `APP_BASE_URL` environment variable:**
   - In Render dashboard → Your service → Environment
   - Find `APP_BASE_URL`
   - Change to: `https://your-app-name.onrender.com`
   - Click **"Save Changes"**
   - Service will restart automatically

**Save this URL** - you'll need it!

---

## Part 2: Test Your Deployment

### Step 2.1: Test Health Endpoint

**Where**: Your browser or terminal
**What**: Check if server is running

**Option A: Browser**
1. Open: `https://your-app-name.onrender.com/health`
2. Should see: `{"ok":true,"service":"voice-ai-backend"}`

**Option B: Terminal (PowerShell)**
```powershell
Invoke-WebRequest -Uri "https://your-app-name.onrender.com/health" -UseBasicParsing
```

**If it works**: ✅ Move to next step
**If it fails**: Check Render logs for errors

---

### Step 2.2: Test Registration

**Where**: Terminal or Postman
**What**: Create a test user

**Using PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "test123456"
    name = "Test User"
    businessName = "Test Business"
    phoneNumber = "+15551234567"
    timeZone = "America/New_York"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://your-app-name.onrender.com/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

**Expected Response:**
```json
{
  "user": { "id": "...", "email": "test@example.com" },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

**Save the `access_token`** - you'll need it for next test!

---

### Step 2.3: Test Protected Endpoint

**Where**: Terminal
**What**: Test authentication

**Using PowerShell:**
```powershell
$token = "YOUR_ACCESS_TOKEN_FROM_STEP_2.2"

Invoke-WebRequest -Uri "https://your-app-name.onrender.com/calls" `
    -Headers @{ Authorization = "Bearer $token" } `
    -UseBasicParsing
```

**Expected Response:**
```json
{
  "calls": []
}
```

**If it works**: ✅ Your API is working!
**If you get 401**: Token is wrong or expired - try registering again

---

## Part 3: Configure Twilio Webhooks

### Step 3.1: Go to Twilio Console

**Where**: https://console.twilio.com
**What**: Configure your phone number

1. Sign in to Twilio
2. Go to **"Phone Numbers"** → **"Manage"** → **"Active Numbers"**
3. Click on your phone number (the one you purchased)

---

### Step 3.2: Set Voice Webhook

**Where**: Twilio phone number configuration page
**What**: Point to your production URL

1. Scroll to **"Voice & Fax"** section
2. Find **"A CALL COMES IN"**
3. Set to: **"Webhook"**
4. URL: `https://your-app-name.onrender.com/webhook/twilio/voice`
5. Method: **POST**
6. Click **"Save"**

---

### Step 3.3: Set Status Callback

**Where**: Same page
**What**: Track call status

1. Find **"STATUS CALLBACK URL"**
2. URL: `https://your-app-name.onrender.com/webhook/twilio/status`
3. Method: **POST**
4. Click **"Save"**

---

### Step 3.4: Test with a Call (Optional)

**Where**: Your phone
**What**: Make a test call

1. Call your Twilio number from your phone
2. Should hear voicemail prompt (if using voicemail mode)
3. Leave a message
4. Check Render logs to see if webhook was called
5. Check Supabase `calls` table to see if call was recorded

**If it works**: ✅ Webhooks are configured!
**If it doesn't**: Check Render logs for errors

---

## Part 4: Create Test Account for iOS Dev

### Step 4.1: Register Test User

**Where**: Use the registration endpoint (Step 2.2)
**What**: Create a test account

Use these credentials:
- **Email**: `ios-test@yourapp.com` (or any email)
- **Password**: `Test123456!` (or any secure password)
- **Name**: `iOS Test User`
- **Business**: `Test Business`

**Save these credentials** - you'll share with iOS dev!

---

### Step 4.2: Test Subscription (Optional)

**Where**: If you have StoreKit set up
**What**: Test auto-number allocation

1. In iOS app (when ready), subscribe to Pro/Business plan
2. Validate receipt via `POST /billing/validate`
3. Check if number was auto-allocated
4. Verify in Supabase `phone_numbers` table

**This is optional** - can test later with iOS dev

---

## Part 5: Prepare Handoff Package

### Step 5.1: Create Handoff Document

**Where**: Your project folder
**What**: Create a simple text file with info

Create file: `FOR_IOS_DEVELOPER.txt`

```
API BASE URL:
https://your-app-name.onrender.com

TEST ACCOUNT:
Email: ios-test@yourapp.com
Password: Test123456!

ENVIRONMENT VARIABLES FOR iOS APP:
BACKEND_API_URL=https://your-app-name.onrender.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ... (get from Supabase Dashboard → Settings → API)

DOCUMENTATION:
- API_DOCUMENTATION.md (full endpoint reference)
- README.md (project overview)
- IOS_DEVELOPER_HANDOFF.md (handoff guide)

IMPORTANT:
- All protected endpoints need: Authorization: Bearer <token>
- Get token from /register or /login response
- Never share SUPABASE_SERVICE_ROLE_KEY or TWILIO_AUTH_TOKEN
```

---

### Step 5.2: Share Files

**Where**: Email, Slack, or GitHub
**What**: Send to iOS developer

**Files to share:**
1. `API_DOCUMENTATION.md` - Full API reference
2. `FOR_IOS_DEVELOPER.txt` - Quick reference (from Step 5.1)
3. `IOS_DEVELOPER_HANDOFF.md` - Detailed handoff guide
4. `README.md` - Project overview

**How to share:**
- **Option A**: Upload to GitHub and share repo link
- **Option B**: Email the files
- **Option C**: Share via Google Drive/Dropbox

---

## Part 6: Verify Everything Works

### Final Checklist

Before handing off, verify:

- [ ] ✅ Backend deployed: `https://your-app-name.onrender.com/health` works
- [ ] ✅ Registration works: Can create user
- [ ] ✅ Login works: Can get access token
- [ ] ✅ Protected endpoints work: Can call `/calls` with token
- [ ] ✅ Twilio webhooks configured: Voice and Status URLs set
- [ ] ✅ Test account created: Credentials saved
- [ ] ✅ Documentation shared: All files sent to iOS dev
- [ ] ✅ Production URL shared: iOS dev has the URL

---

## Troubleshooting

### Problem: Deployment fails
**Solution**: 
- Check Render logs
- Verify all environment variables are set
- Check `package.json` has `build` and `start` scripts
- Make sure code is pushed to GitHub

### Problem: Health endpoint returns error
**Solution**:
- Check Render logs
- Verify `PORT` environment variable is set
- Check if server started successfully

### Problem: Registration fails
**Solution**:
- Check Supabase connection
- Verify `SUPABASE_URL` and keys are correct
- Check Render logs for errors

### Problem: Protected endpoint returns 401
**Solution**:
- Make sure token is in header: `Authorization: Bearer <token>`
- Token might be expired - register/login again
- Check token format (should start with `eyJ`)

### Problem: Twilio webhook not working
**Solution**:
- Verify URL is correct (no typos)
- Check Render logs when call comes in
- Make sure `APP_BASE_URL` is set correctly
- Test webhook URL manually: `https://your-app.onrender.com/webhook/twilio/voice`

---

## Quick Reference Commands

### Test Health
```powershell
Invoke-WebRequest -Uri "https://your-app-name.onrender.com/health" -UseBasicParsing
```

### Register User
```powershell
$body = @{email="test@example.com";password="test123456";name="Test"} | ConvertTo-Json
Invoke-WebRequest -Uri "https://your-app-name.onrender.com/register" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

### Test Protected Endpoint
```powershell
$token = "YOUR_TOKEN"
Invoke-WebRequest -Uri "https://your-app-name.onrender.com/calls" -Headers @{Authorization="Bearer $token"} -UseBasicParsing
```

---

## Summary

**What you did:**
1. ✅ Deployed backend to Render
2. ✅ Tested all endpoints
3. ✅ Configured Twilio webhooks
4. ✅ Created test account
5. ✅ Prepared handoff package

**What iOS dev needs:**
- Production URL
- Test account credentials
- API documentation
- Environment variables (public ones only)

**Time taken**: ~1 hour
**Status**: ✅ Ready for handoff!

---

**Need help?** Check Render logs or ask for assistance with specific errors.

