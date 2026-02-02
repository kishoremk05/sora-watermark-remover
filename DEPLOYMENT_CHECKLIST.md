# ✅ Deployment Checklist

## Before You Start
- [ ] Code is working locally
- [ ] You have a GitHub account
- [ ] You have a Render account (or create one)
- [ ] You have your Kie AI API key
- [ ] You have credits in your Kie AI account

## Deployment Steps

### 1. Push to GitHub (5 minutes)
- [ ] Initialize git: `git init`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repo at https://github.com/new
- [ ] Push code: `git push -u origin main`

### 2. Deploy to Render (10 minutes)
- [ ] Go to https://render.com
- [ ] Sign up/Login with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure settings:
  - Name: `sora-watermark-remover`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance Type: Free
- [ ] Add environment variables:
  - `KIE_API_KEY`: Your API key
  - `USE_REAL_API`: `true`
  - `NODE_ENV`: `production`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)

### 3. Configure Callback URL (2 minutes)
- [ ] Copy your Render URL (e.g., `https://your-app.onrender.com`)
- [ ] In Render dashboard → Environment tab
- [ ] Add new variable:
  - Key: `BASE_URL`
  - Value: Your Render URL (without trailing slash)
- [ ] Save (auto-redeploys)

### 4. Test Your App (2 minutes)
- [ ] Open your Render URL
- [ ] Paste a Sora video URL
- [ ] Click "Remove Watermark"
- [ ] Wait 10-30 seconds
- [ ] Video downloads directly! ✅

## Expected Results

### ✅ Success Indicators
- Green status in Render dashboard
- App loads at your URL
- Video processing works
- Direct download on your website
- No need to check Kie AI dashboard

### ❌ Common Issues

**"Build failed"**
- Solution: Check Render logs, verify package.json

**"Service unavailable"**
- Solution: Check if service is running (green dot)

**"Callbacks not received"**
- Solution: Verify BASE_URL is set correctly

**"Out of credits"**
- Solution: Add credits to Kie AI account

## After Deployment

### Share Your App
Your app is now live at: `https://your-app.onrender.com`

### Monitor Usage
- View logs in Render dashboard
- Check callback data
- Monitor credit usage in Kie AI

### Update Your App
```bash
git add .
git commit -m "Update"
git push
```
Render auto-deploys!

## 🎉 Congratulations!

You now have a fully functional Sora watermark remover that:
- ✅ Works on any device
- ✅ Has a public URL
- ✅ Downloads videos directly
- ✅ Uses Kie AI API
- ✅ Costs $0 to host (free tier)

---

**Need help?** Check `DEPLOY_TO_RENDER.md` for detailed instructions.
