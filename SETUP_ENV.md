# 🔑 Environment Variables Setup

## ❌ Current Error
Your server is failing because these environment variables are missing:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID` ✅ (You have this)
- `TWILIO_AUTH_TOKEN` ✅ (You have this)
- `OPENAI_API_KEY`

## ✅ Quick Fix

### Step 1: Create `.env` file
In your project root (`C:\Users\kammi\OneDrive\Desktop\pp`), create a file named `.env`

### Step 2: Copy this template and fill in values

```bash
# Server
PORT=8080
APP_BASE_URL=http://localhost:8080

# Supabase (Get from Supabase Dashboard)
SUPABASE_URL=https://uyxuakmjxzizntreuykv.supabase.co
SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

# Twilio (You already have these ✅)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+12184141541

# OpenAI (Get from OpenAI Dashboard)
OPENAI_API_KEY=sk-paste_your_openai_key_here
```

### Step 3: Get Supabase Keys
1. Go to: https://supabase.com/dashboard/project/uyxuakmjxzizntreuykv/settings/api
2. Copy:
   - **Project URL** → `SUPABASE_URL` (already filled above ✅)
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### Step 4: Get OpenAI Key
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key → `OPENAI_API_KEY`

### Step 5: Save `.env` file
- Make sure file is named exactly `.env` (not `.env.txt`)
- Save in project root: `C:\Users\kammi\OneDrive\Desktop\pp\.env`

### Step 6: Restart server
```powershell
npm run dev
```

---

## 📝 Complete `.env` File Example

```bash
PORT=8080
APP_BASE_URL=http://localhost:8080

SUPABASE_URL=https://uyxuakmjxzizntreuykv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eHVha21qeHppem50cmV1eWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0Mjg4MDAsImV4cCI6MjA0NzAwNDgwMH0.your_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eHVha21qeHppem50cmV1eWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTQyODgwMCwiZXhwIjoyMDQ3MDA0ODAwfQ.your_key_here

TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+12184141541

OPENAI_API_KEY=sk-proj-your_openai_key_here
```

---

## ⚠️ Important Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore` ✅
2. **Never share `SUPABASE_SERVICE_ROLE_KEY`** - It has full database access
3. **Never share `TWILIO_AUTH_TOKEN`** - It can control your Twilio account
4. **File must be named `.env`** - Not `.env.txt` or `env.txt`

---

## ✅ Verification

After creating `.env`, run:
```powershell
npm run dev
```

You should see:
```
API listening on http://localhost:8080
```

If you still see errors, check:
- File is named exactly `.env` (no extension)
- File is in project root (same folder as `package.json`)
- All keys are on separate lines
- No quotes around values (unless the value itself contains spaces)

