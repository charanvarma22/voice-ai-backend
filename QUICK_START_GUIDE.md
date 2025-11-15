# ⚡ Quick Start: Deploy in 30 Minutes

## 🎯 Goal
Get your backend live so iOS developer can use it.

---

## 📋 Step-by-Step (Follow in Order)

### STEP 1: Sign Up for Render (5 min)

**WHERE**: https://render.com

**WHAT TO DO**:
1. Click "Get Started for Free"
2. Sign up with GitHub (easiest)
3. Verify email

**DONE WHEN**: You see Render dashboard

---

### STEP 2: Push Code to GitHub (5 min)

**WHERE**: Your computer + https://github.com

**IF CODE IS ALREADY ON GITHUB**: Skip to Step 3

**IF NOT ON GITHUB**:
1. Go to https://github.com → Sign in
2. Click "New repository" (green button)
3. Name: `voice-ai-backend`
4. Click "Create repository"
5. Open PowerShell in your project folder:
   ```powershell
   cd C:\Users\kammi\OneDrive\Desktop\pp
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/voice-ai-backend.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

**DONE WHEN**: Code is on GitHub

---

### STEP 3: Create Web Service in Render (10 min)

**WHERE**: Render dashboard

**WHAT TO DO**:
1. Click **"New"** → **"Web Service"**
2. Connect GitHub account (if not connected)
3. Select your repository: `voice-ai-backend`
4. Click **"Connect"**

**FILL IN THESE FIELDS**:
- **Name**: `voice-ai-backend`
- **Region**: Choose closest (e.g., `Oregon`)
- **Branch**: `main`
- **Root Directory**: Leave empty (or `m1-backend` if code is in subfolder)
- **Environment**: **Node**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**DONE WHEN**: Form is filled, ready to add environment variables

---

### STEP 4: Add Environment Variables (10 min)

**WHERE**: Same page, scroll to "Environment Variables"

**WHAT TO DO**: Click "Add Environment Variable" for each:

| Variable Name | Value (Get From) |
|--------------|------------------|
| `PORT` | `8080` |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `TWILIO_ACCOUNT_SID` | Twilio Console → Account |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Account |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `APP_BASE_URL` | `https://your-app-name.onrender.com` (update after deployment) |
| `AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE` | `true` (optional) |
| `DEFAULT_PHONE_COUNTRY` | `US` (optional) |

**HOW TO GET VALUES**:
- Open your local `.env` file
- Copy each value
- Paste into Render

**DONE WHEN**: All 10 variables added

---

### STEP 5: Deploy (5 min)

**WHERE**: Same page, bottom

**WHAT TO DO**:
1. Scroll down
2. Click **"Create Web Service"** (blue button)
3. Wait 5-10 minutes
4. Watch logs - you'll see "Your service is live at..."

**DONE WHEN**: You see "Your service is live"

---

### STEP 6: Update APP_BASE_URL (2 min)

**WHERE**: Render dashboard → Your service → Environment

**WHAT TO DO**:
1. Copy your URL: `https://your-app-name.onrender.com`
2. Find `APP_BASE_URL` variable
3. Change value to your URL
4. Click "Save Changes"
5. Service restarts automatically

**DONE WHEN**: `APP_BASE_URL` matches your Render URL

---

### STEP 7: Test Health Endpoint (1 min)

**WHERE**: Browser

**WHAT TO DO**:
1. Open: `https://your-app-name.onrender.com/health`
2. Should see: `{"ok":true,"service":"voice-ai-backend"}`

**IF IT WORKS**: ✅ Move to next step
**IF IT FAILS**: Check Render logs for errors

---

### STEP 8: Test Registration (2 min)

**WHERE**: PowerShell

**WHAT TO DO**:
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

**EXPECTED**: JSON with `user` and `session` (save the `access_token`)

**DONE WHEN**: Registration works

---

### STEP 9: Configure Twilio Webhooks (5 min)

**WHERE**: https://console.twilio.com

**WHAT TO DO**:
1. Go to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click your phone number
3. Scroll to **"Voice & Fax"**
4. **"A CALL COMES IN"**:
   - Set to: **Webhook**
   - URL: `https://your-app-name.onrender.com/webhook/twilio/voice`
   - Method: **POST**
5. **"STATUS CALLBACK URL"**:
   - URL: `https://your-app-name.onrender.com/webhook/twilio/status`
   - Method: **POST**
6. Click **"Save"** for both

**DONE WHEN**: Both webhooks saved

---

### STEP 10: Create Test Account (2 min)

**WHERE**: Use registration endpoint (Step 8)

**WHAT TO DO**:
Create account with:
- Email: `ios-test@yourapp.com`
- Password: `Test123456!`
- Name: `iOS Test User`

**SAVE THESE CREDENTIALS** - share with iOS dev!

---

### STEP 11: Share with iOS Developer (5 min)

**WHERE**: Email/Slack/GitHub

**WHAT TO SHARE**:

**Files**:
1. `API_DOCUMENTATION.md`
2. `FOR_IOS_DEVELOPER.txt` (create this - see below)
3. `IOS_DEVELOPER_HANDOFF.md`

**Create `FOR_IOS_DEVELOPER.txt`**:
```
API BASE URL:
https://your-app-name.onrender.com

TEST ACCOUNT:
Email: ios-test@yourapp.com
Password: Test123456!

ENVIRONMENT VARIABLES FOR iOS:
BACKEND_API_URL=https://your-app-name.onrender.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ... (from Supabase Dashboard)
```

**DONE WHEN**: Files sent to iOS dev

---

## ✅ Final Checklist

Before saying "ready", verify:

- [ ] Backend deployed: Health endpoint works
- [ ] Registration works: Can create user
- [ ] Login works: Can get token
- [ ] Protected endpoints work: Can call `/calls` with token
- [ ] Twilio webhooks configured
- [ ] Test account created
- [ ] Documentation shared

---

## 🆘 Common Problems

### "Deployment failed"
→ Check Render logs
→ Verify all environment variables are set
→ Make sure code is on GitHub

### "Health endpoint returns error"
→ Check Render logs
→ Verify `PORT=8080` is set
→ Check if server started

### "Registration fails"
→ Check Supabase connection
→ Verify Supabase keys are correct
→ Check Render logs

### "401 Unauthorized"
→ Make sure token is in header: `Authorization: Bearer <token>`
→ Token might be expired - login again

---

## 📞 Quick Test Commands

**Test Health**:
```powershell
Invoke-WebRequest -Uri "https://your-app-name.onrender.com/health" -UseBasicParsing
```

**Register User**:
```powershell
$body = @{email="test@example.com";password="test123456";name="Test"} | ConvertTo-Json
Invoke-WebRequest -Uri "https://your-app-name.onrender.com/register" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

**Test Protected** (replace `YOUR_TOKEN`):
```powershell
$token = "YOUR_TOKEN"
Invoke-WebRequest -Uri "https://your-app-name.onrender.com/calls" -Headers @{Authorization="Bearer $token"} -UseBasicParsing
```

---

## 🎉 Done!

**Total Time**: ~30-45 minutes
**Status**: ✅ Ready for iOS developer

**What you have**:
- ✅ Live backend API
- ✅ Test account
- ✅ Documentation
- ✅ Twilio configured

**Next**: Share with iOS developer and they can start building!

---

**Need help?** Check `STEP_BY_STEP_DEPLOYMENT.md` for detailed instructions.

