# 🔄 How to Restart the Server

## The Issue
The server is still using the old code. You need to restart it to load the new changes.

## Steps to Restart

1. **Stop the current server:**
   - Go to the terminal where `npm start` is running
   - Press `Ctrl + C` to stop the server

2. **Start the server again:**
   ```bash
   npm start
   ```

3. **Refresh your browser:**
   - Go to http://localhost:4000
   - Press `Ctrl + F5` to hard refresh

## What Changed

The app now:
- ✅ Accepts Sora video URLs (not file uploads)
- ✅ Uses the real Kie AI API
- ✅ Actually removes watermarks
- ✅ Costs $0.05 per video (10 credits)

## Test URL

Try this example Sora URL:
```
https://sora.chatgpt.com/p/s_68e83bd7eee88191be79d2ba7158516f
```

Or use any public Sora video URL from https://sora.chatgpt.com/

## Expected Behavior

1. Paste a Sora URL
2. Click "Remove Watermark"
3. Wait 5-30 seconds (API processing time)
4. Download the cleaned video

## If You Still See Errors

Check the server console logs - they will show:
- Whether the API key is detected
- Task creation status
- Processing progress
- Any API errors

The server should show:
```
🚀 Server running on http://localhost:4000
🔑 API Key configured: Yes
🤖 Mode: Real API
```
