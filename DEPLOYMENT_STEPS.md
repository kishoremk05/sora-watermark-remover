# 🚀 Complete Deployment Steps

## ✅ Step 1: Push to GitHub (Do This Now)

Your Git repository is ready! Run this command in your terminal:

```bash
git push -u origin main
```

If it asks for authentication, follow GitHub's prompts.

---

## 📋 Step 2: Deploy to Render (After GitHub Push)

### 2.1 Create Render Account
1. Go to **https://render.com**
2. Click "Get Started"
3. Sign up with GitHub (easiest option)

### 2.2 Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect"** next to `sora-watermark-remover` repository
4. If you don't see it, click "Configure account" and grant Render access to your repos

### 2.3 Configure Service

Fill in these exact settings:

| Setting | Value |
|---------|-------|
| **Name** | `sora-watermark-remover` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | Leave empty |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 2.4 Add Environment Variables

Click **"Advanced"** and add these 3 variables:

```
KIE_API_KEY = your_actual_kie_api_key_here
USE_REAL_API = true
NODE_ENV = production
```

⚠️ **Important**: Do NOT add `BASE_URL` yet! We'll add it after deployment.

### 2.5 Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes (watch the build logs)
3. When done, you'll see: `Your service is live at https://sora-watermark-remover-xxxx.onrender.com`
4. **Copy this URL!**

---

## 🔗 Step 3: Add Callback URL

### 3.1 Add BASE_URL Environment Variable

1. In Render dashboard, go to your service
2. Click **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `BASE_URL`
   - **Value**: `https://sora-watermark-remover-xxxx.onrender.com` (your URL from step 2.5)
5. Click **"Save Changes"**

The service will automatically redeploy (takes 1-2 minutes).

---

## 🎉 Step 4: Test Your App!

1. Open your Render URL: `https://sora-watermark-remover-xxxx.onrender.com`
2. Paste a Sora video URL (e.g., `https://sora.chatgpt.com/...`)
3. Click **"Remove Watermark"**
4. Wait 10-30 seconds
5. **Video downloads directly to your website!** ✅

---

## 🔍 Troubleshooting

### Build Failed?
- Check build logs in Render dashboard
- Verify `package.json` exists
- Make sure all files were pushed to GitHub

### Callbacks Not Working?
- Verify `BASE_URL` is set correctly (no trailing slash)
- Check Render logs for incoming POST requests to `/api/callback`
- Ensure URL is HTTPS (not HTTP)

### Out of Credits?
- Add credits at https://kie.ai/dashboard
- Error will show in Render logs

---

## 📊 Monitor Your App

### View Logs
1. Render dashboard → Your service
2. Click **"Logs"** tab
3. See real-time activity including:
   - ✅ Task created successfully
   - ✅ Received callback from Kie AI
   - ✅ Callback stored for task

### Check Status
- **Green dot** = Running ✅
- **Yellow** = Deploying 🔄
- **Red** = Error ❌ (check logs)

---

## 🎯 Summary

```
1. Push to GitHub ← DO THIS NOW
2. Create Render account
3. Deploy web service
4. Add BASE_URL after deployment
5. Test with Sora URL
6. Done! 🎉
```

**Current Status**: ✅ Git repository ready → ⏳ Waiting for GitHub push
