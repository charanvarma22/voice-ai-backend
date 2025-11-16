# 🔧 Render Deployment Troubleshooting

## Your Current Issue: "Failed deploy" Status

The deployment is failing. Here's how to fix it:

---

## Step 1: Check Render Logs

**Go to**: Render Dashboard → `voice-ai-backend` → **Logs** tab

**Look for errors like**:
- ❌ "Environment validation failed"
- ❌ "Cannot find module"
- ❌ "Build failed"
- ❌ "Missing environment variable"

---

## Step 2: Fix Build Command

**Current Issue**: Your build command might be missing the actual build step.

**Go to**: Render Dashboard → `voice-ai-backend` → **Settings** → **Build & Deploy**

**Current Build Command** (might be wrong):
```
npm install
```

**Should be**:
```
npm install && npm run build
```

**Why**: 
- `npm install` only installs dependencies
- `npm run build` compiles TypeScript to JavaScript
- Without build, `dist/server.js` won't exist
- Server can't start without the compiled code

**Fix**:
1. Go to Settings → Build & Deploy
2. Change Build Command to: `npm install && npm run build`
3. Click **Save Changes**
4. Service will redeploy automatically

---

## Step 3: Verify Environment Variables

**Go to**: Render Dashboard → `voice-ai-backend` → **Environment** tab

**Required Variables** (must have all 8):
- [ ] `PORT` = `8080`
- [ ] `SUPABASE_URL` = `https://uyxuakmjxzizntreuykv.supabase.co`
- [ ] `SUPABASE_ANON_KEY` = (your anon key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
- [ ] `TWILIO_ACCOUNT_SID` = (your Twilio SID)
- [ ] `TWILIO_AUTH_TOKEN` = (your Twilio token)
- [ ] `OPENAI_API_KEY` = (your OpenAI key)
- [ ] `APP_BASE_URL` = `https://voice-ai-backend-xikb.onrender.com`

**If any are missing**: The server will fail with "Environment validation failed"

**How to add**:
1. Click **"Add Environment Variable"**
2. Enter name and value
3. Click **Save Changes**
4. Service will restart

---

## Step 4: Verify Start Command

**Go to**: Render Dashboard → `voice-ai-backend` → **Settings** → **Build & Deploy**

**Start Command should be**:
```
npm start
```

**Which runs**: `node dist/server.js` (from package.json)

**If wrong**: Change it to `npm start`

---

## Step 5: Common Error Messages & Fixes

### Error: "Environment validation failed"
**Cause**: Missing or invalid environment variables
**Fix**: Add all 8 required variables (see Step 3)

### Error: "Cannot find module 'dist/server.js'"
**Cause**: Build didn't run (missing `npm run build`)
**Fix**: Update Build Command to `npm install && npm run build`

### Error: "Build failed" or TypeScript errors
**Cause**: TypeScript compilation errors
**Fix**: 
1. Check logs for specific error
2. Test build locally: `npm run build`
3. Fix TypeScript errors
4. Commit and push to GitHub

### Error: "Port already in use" or "EADDRINUSE"
**Cause**: PORT environment variable not set or wrong
**Fix**: Set `PORT=8080` in environment variables

### Error: "Module not found" or missing dependencies
**Cause**: Dependencies not installed
**Fix**: 
1. Check `package.json` is committed to GitHub
2. Verify Build Command includes `npm install`

---

## Step 6: Manual Redeploy

After fixing issues:

1. **Option A: Auto-redeploy**
   - Push changes to GitHub (if you fixed code)
   - Render will auto-deploy

2. **Option B: Manual deploy**
   - Go to Render Dashboard → `voice-ai-backend`
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Step 7: Verify Deployment

**After deployment succeeds**:

1. **Check Status**: Should show "Live" (green) instead of "Failed deploy"

2. **Test Health Endpoint**:
   ```
   https://voice-ai-backend-xikb.onrender.com/health
   ```
   Should return: `{"ok":true,"service":"voice-ai-backend"}`

3. **Check Logs**: Should see:
   ```
   API listening on http://localhost:8080
   ```

---

## Quick Fix Checklist

- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] All 8 environment variables set
- [ ] Code pushed to GitHub
- [ ] Service redeployed
- [ ] Health endpoint works

---

## Still Not Working?

1. **Check Render Logs** (most important!)
   - Go to Logs tab
   - Copy the error message
   - Look for specific line numbers or file names

2. **Test Locally First**:
   ```bash
   npm install
   npm run build
   npm start
   ```
   If this fails locally, fix it before deploying

3. **Verify GitHub Connection**:
   - Render → Settings → Build & Deploy
   - Check repository and branch are correct

4. **Check TypeScript Config**:
   - Verify `tsconfig.json` is correct
   - Test: `npm run build` should create `dist/` folder

---

## Expected Successful Log Output

When deployment works, you should see:

```
==> Building...
npm install
[installs dependencies]
npm run build
[compiles TypeScript]
==> Starting...
npm start
API listening on http://localhost:8080
==> Your service is live at https://voice-ai-backend-xikb.onrender.com
```

