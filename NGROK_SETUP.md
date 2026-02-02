# 🌐 Setting Up Ngrok for Callbacks

## The Problem

The Kie AI API needs to send a callback to your server when processing is complete. But your server is running on `localhost:5000`, which is not accessible from the internet.

## The Solution: Ngrok

Ngrok creates a public URL that tunnels to your localhost.

### Step 1: Install Ngrok

**Option A: Download**
1. Go to https://ngrok.com/download
2. Download for Windows
3. Extract the zip file

**Option B: Using Chocolatey**
```bash
choco install ngrok
```

### Step 2: Sign Up (Free)
1. Go to https://dashboard.ngrok.com/signup
2. Create a free account
3. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Configure Ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 4: Start Ngrok Tunnel
Open a **new terminal** and run:
```bash
ngrok http 5000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
```

### Step 5: Update Your .env File

Copy the `https://` URL from ngrok and add it to `.env`:

```env
PORT=5000
KIE_API_KEY=25e65c6faea4d394d44595deb4f0f8a7
USE_REAL_API=true
CALLBACK_BASE_URL=https://abc123.ngrok-free.app
```

### Step 6: Restart Your Server

```bash
npm start
```

Now when you process a video, the Kie AI API can send callbacks to your server!

## Alternative: Use a Cloud Server

Instead of ngrok, you can deploy to:
- **Render** (free tier available)
- **Railway** (free tier available)
- **Heroku** (paid)
- **DigitalOcean** ($5/month)

Then your callback URL will be your deployed URL (e.g., `https://your-app.onrender.com`)

## Troubleshooting

### "Callback not received"
- Make sure ngrok is running
- Check that the ngrok URL matches your .env
- Verify your server restarted after changing .env

### "Ngrok session expired"
- Free ngrok sessions expire after 2 hours
- Restart ngrok and update your .env with the new URL
- Consider upgrading to ngrok paid plan for persistent URLs

### "Still not working"
- Check server logs for callback attempts
- Verify your API key is valid
- Try the test URL from Kie AI documentation
