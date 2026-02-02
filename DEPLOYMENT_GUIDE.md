# 🚀 Quick Deployment Guide

## ✅ Good News!
Your code is **already callback-ready**! No code changes needed. Just deploy and configure.

---

## Option 1: Deploy to Render (Recommended - Permanent)

### Step 1: Push to GitHub (5 minutes)

```bash
# Check if Git is initialized
git status

# If not initialized, run:
git init
git add .
git commit -m "Initial commit - Sora Watermark Remover"

# Create repo on GitHub: https://github.com/new
# Name it: sora-watermark-remover
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/sora-watermark-remover.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render (10 minutes)

1. **Create Account**
   - Go to https://render.com
   - Sign up with GitHub (easiest)

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `sora-watermark-remover`
     - **Runtime**: Node
     - **Build**: `npm install`
     - **Start**: `npm start`
     - **Instance**: Free

3. **Add Environment Variables** (Click "Advanced")
   ```
   KIE_API_KEY = your_kie_api_key_here
   USE_REAL_API = true
   NODE_ENV = production
   ```
   
   ⚠️ **Don't add BASE_URL yet!**

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Copy your URL: `https://sora-watermark-remover-xxxx.onrender.com`

### Step 3: Add Callback URL (2 minutes)

1. In Render dashboard → Environment tab
2. Add variable:
   ```
   BASE_URL = https://sora-watermark-remover-xxxx.onrender.com
   ```
3. Save (auto-redeploys in 1-2 min)

### Step 4: Test! 🎉

1. Open your Render URL
2. Paste Sora video URL
3. Click "Remove Watermark"
4. Wait 10-30 seconds
5. **Video downloads directly!** ✅

---

## Option 2: Test Locally with ngrok (Quick - Temporary)

Perfect for testing callbacks **right now** without deploying:

### Step 1: Install ngrok
```bash
npm install -g ngrok
```

### Step 2: Start Server
```bash
npm start
```

### Step 3: Start ngrok (New Terminal)
```bash
ngrok http 5000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Step 4: Update .env
```
BASE_URL=https://abc123.ngrok-free.app
```

### Step 5: Restart Server
```bash
# Ctrl+C to stop
npm start
```

### Step 6: Test!
Open `http://localhost:5000` and test with a Sora URL.

⚠️ **Note**: ngrok URL changes every restart. Use Render for permanent solution.

---

## How It Works

```
User submits URL → Your server creates task with callback
                 ↓
            Kie AI processes (10-30 sec)
                 ↓
            Kie AI sends result to YOUR callback URL
                 ↓
            Your server stores result
                 ↓
            Frontend polls and gets result
                 ↓
            User downloads from YOUR website ✅
```

---

## Troubleshooting

### "Callbacks not working"
- Check Render logs for incoming POST to `/api/callback`
- Verify `BASE_URL` has no trailing slash
- Ensure it's HTTPS (not HTTP)

### "Out of credits"
- Add credits at https://kie.ai/dashboard
- Check error in Render logs

### "Service sleeping"
- Render free tier sleeps after 15 min
- First request takes 30-60s to wake up
- Upgrade to Starter ($7/mo) to prevent sleeping

---

## Next Steps

1. ✅ Choose deployment method (Render or ngrok)
2. ✅ Follow steps above
3. ✅ Test with real Sora URL
4. ✅ Share your deployed URL!

Need help? Check the detailed [implementation_plan.md](file:///C:/Users/kisho/.gemini/antigravity/brain/a6d05506-bbc6-4f3e-9f87-b31923c3d86f/implementation_plan.md)
