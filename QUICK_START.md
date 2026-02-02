# 🚀 Quick Start Guide

## Current Status

✅ Server configured with real Kie AI API  
✅ API key loaded  
⚠️ **Callback URL needs setup for production use**

## For Testing (Localhost)

The app is currently configured but **callbacks won't work on localhost** because Kie AI can't reach your computer.

### Option 1: Use Ngrok (Recommended for Testing)

1. **Install ngrok**: https://ngrok.com/download
2. **Start ngrok**:
   ```bash
   ngrok http 5000
   ```
3. **Copy the https URL** (e.g., `https://abc123.ngrok-free.app`)
4. **Update `.env`**:
   ```env
   CALLBACK_BASE_URL=https://abc123.ngrok-free.app
   ```
5. **Restart server**:
   ```bash
   npm start
   ```

See `NGROK_SETUP.md` for detailed instructions.

### Option 2: Deploy to Cloud (Recommended for Production)

Deploy to a cloud platform so you have a public URL:

**Render (Free)**
1. Push code to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy!

**Railway (Free)**
1. Push code to GitHub  
2. Connect to Railway
3. Set environment variables
4. Deploy!

Then set `CALLBACK_BASE_URL` to your deployed URL.

## How It Works

1. User pastes a Sora video URL
2. Your server calls Kie AI API to create a watermark removal task
3. Kie AI processes the video (10-60 seconds)
4. Kie AI sends a callback to your server with the result
5. Your server downloads the clean video
6. User gets the watermark-free video

## Cost

- **$0.05 per video** (10 credits)
- Free credits available for testing

## Troubleshooting

### "Task timeout"
- Callback URL is not publicly accessible
- Set up ngrok or deploy to cloud

### "API Key configured: No"
- Restart the server after changing `.env`
- Verify `.env` file exists and has correct format

### "Mock mode enabled"
- Check `USE_REAL_API=true` in `.env`
- Restart server

## Files Overview

- `index.html` - Frontend UI
- `app.js` - Frontend JavaScript
- `server.js` - Backend API server
- `.env` - Configuration (API keys, URLs)
- `NGROK_SETUP.md` - Detailed ngrok instructions
- `README.md` - Full documentation

## Next Steps

1. Set up ngrok OR deploy to cloud
2. Update `CALLBACK_BASE_URL` in `.env`
3. Restart server
4. Test with a Sora video URL!

---

**Need help?** Check the other documentation files or the console logs for detailed error messages.
