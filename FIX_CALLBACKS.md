# 🔧 Fix: Enable Direct Downloads on Your Website

## Problem
Videos are processing successfully in Kie AI, but your website redirects to the dashboard instead of showing the video for download.

## Root Cause
The callback URL isn't configured correctly, so Kie AI can't send results back to your website.

---

## ✅ Solution: Add BASE_URL Environment Variable

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your `sora-watermark-remover` service

### Step 2: Add BASE_URL
1. Click **"Environment"** tab (left sidebar)
2. Look for `BASE_URL` variable
   - **If it exists**: Click "Edit" and verify the value
   - **If it doesn't exist**: Click "Add Environment Variable"

3. Set these values:
   - **Key**: `BASE_URL`
   - **Value**: `https://sora-watermark-remover-g7xg.onrender.com`

4. Click **"Save Changes"**

### Step 3: Wait for Redeploy
- Render will automatically redeploy (1-2 minutes)
- Watch the "Events" tab for "Deploy succeeded"

---

## 🧪 Test After Fix

1. Go to: https://sora-watermark-remover-g7xg.onrender.com
2. Paste a Sora video URL
3. Click "Remove Watermark"
4. Wait 10-30 seconds
5. **Video should now download directly!** ✅

---

## 🔍 How to Verify It's Working

### Check Render Logs
1. In Render dashboard → Click "Logs" tab
2. After submitting a video, you should see:
   ```
   ✅ Task created successfully: <taskId>
   ⏳ Waiting for callback from Kie AI...
   Received callback from Kie AI: {...}
   ✅ Callback stored for task: <taskId>
   ```

### What You Should See on Website
- Progress bar fills up
- Video appears in player
- Download button works
- **NO redirect to Kie AI dashboard**

---

## 🐛 Still Not Working?

### Double-Check BASE_URL
Make sure it's EXACTLY:
```
https://sora-watermark-remover-g7xg.onrender.com
```

**Common mistakes:**
- ❌ `http://` instead of `https://`
- ❌ Trailing slash: `https://sora-watermark-remover-g7xg.onrender.com/`
- ❌ Missing the full URL

### Check All Environment Variables
You should have these 4 variables:

| Variable | Value |
|----------|-------|
| `KIE_API_KEY` | Your actual API key |
| `USE_REAL_API` | `true` |
| `NODE_ENV` | `production` |
| `BASE_URL` | `https://sora-watermark-remover-g7xg.onrender.com` |

---

## 📊 Understanding the Flow

### Before Fix (Current Behavior):
```
User → Your Website → Kie AI creates task
                    ↓
              Kie AI processes video
                    ↓
              ❌ Can't send callback (no BASE_URL)
                    ↓
              Website times out → Shows dashboard link
```

### After Fix (Expected Behavior):
```
User → Your Website → Kie AI creates task
                    ↓
              Kie AI processes video (10-30s)
                    ↓
              ✅ Sends callback to BASE_URL/api/callback
                    ↓
              Your website receives result
                    ↓
              User downloads video directly! 🎉
```

---

## 🎯 Quick Checklist

- [ ] Go to Render dashboard
- [ ] Click "Environment" tab
- [ ] Add/verify `BASE_URL` = `https://sora-watermark-remover-g7xg.onrender.com`
- [ ] Save changes
- [ ] Wait for redeploy (1-2 min)
- [ ] Test with a Sora URL
- [ ] Verify video downloads on your site

---

**Need help?** Check the Render logs for any errors or let me know what you see!
