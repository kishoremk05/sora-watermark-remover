# 🚀 Deploy to Render - Step by Step Guide

## Prerequisites
- GitHub account
- Render account (free)
- Your Kie AI API key

## Step 1: Push Code to GitHub

### If you don't have Git initialized:
```bash
git init
git add .
git commit -m "Initial commit - Sora Watermark Remover"
```

### Create GitHub repository:
1. Go to https://github.com/new
2. Name it: `sora-watermark-remover`
3. Don't initialize with README (we already have code)
4. Click "Create repository"

### Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/sora-watermark-remover.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (easiest)

### 2.2 Create New Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Click "Connect" next to your GitHub repository
4. If you don't see it, click "Configure account" and grant access

### 2.3 Configure Service
Fill in these settings:

**Name**: `sora-watermark-remover` (or any name you like)

**Region**: Choose closest to you

**Branch**: `main`

**Root Directory**: Leave empty

**Runtime**: `Node`

**Build Command**: `npm install`

**Start Command**: `npm start`

**Instance Type**: `Free`

### 2.4 Add Environment Variables
Click "Advanced" and add these:

| Key | Value |
|-----|-------|
| `KIE_API_KEY` | Your Kie AI API key |
| `USE_REAL_API` | `true` |
| `NODE_ENV` | `production` |

**Important**: Don't add `BASE_URL` yet - we'll add it after deployment!

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. You'll see build logs

## Step 3: Configure Callback URL

### 3.1 Get Your Render URL
After deployment completes, you'll see:
```
Your service is live at https://sora-watermark-remover-xxxx.onrender.com
```

Copy this URL!

### 3.2 Add BASE_URL Environment Variable
1. In Render dashboard, go to your service
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Add:
   - **Key**: `BASE_URL`
   - **Value**: `https://sora-watermark-remover-xxxx.onrender.com` (your URL)
5. Click "Save Changes"

The service will automatically redeploy (takes 1-2 minutes)

## Step 4: Test Your App!

1. Open your Render URL: `https://sora-watermark-remover-xxxx.onrender.com`
2. Paste a Sora video URL
3. Click "Remove Watermark"
4. Wait 10-30 seconds
5. Video downloads directly to your website! ✅

## 🎉 Success!

Your app is now:
- ✅ Deployed to the cloud
- ✅ Has a public URL
- ✅ Receives callbacks from Kie AI
- ✅ Downloads videos directly on your site
- ✅ No dashboard needed!

## 📊 Monitoring

### View Logs
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs including callback data

### Check Status
- Green dot = Running
- Yellow = Deploying
- Red = Error (check logs)

## 🔄 Updating Your App

When you make code changes:

```bash
git add .
git commit -m "Update feature"
git push
```

Render automatically redeploys! (takes 2-3 minutes)

## 💰 Costs

**Render Free Tier:**
- ✅ Free forever
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Sleeps after 15 min of inactivity
- ⚠️ First request after sleep takes 30-60 seconds

**To prevent sleeping** (optional, $7/month):
- Upgrade to Starter plan
- Or use a free uptime monitor (UptimeRobot)

## 🐛 Troubleshooting

### "Build failed"
- Check build logs in Render
- Make sure `package.json` is correct
- Verify Node version compatibility

### "Service unavailable"
- Check if service is running (green dot)
- View logs for errors
- Verify environment variables are set

### "Callbacks not working"
- Verify `BASE_URL` is set correctly
- Check logs for callback data
- Make sure URL doesn't have trailing slash

### "Out of credits"
- Add credits to Kie AI account
- Check error message in logs

## 📞 Need Help?

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check server logs for detailed errors

---

**Next Steps:**
1. Test your deployed app
2. Share the URL with users
3. Monitor usage in Render dashboard
4. Add more features!
