# 🎬 AI Video Watermark Remover

A modern web application that uses AI to remove watermarks from videos. Built with HTML, Tailwind CSS, JavaScript, and Node.js.

## ✨ Features

- 🎯 Drag & drop video upload
- 📊 Real-time processing progress
- 🎥 Before/after video comparison
- 💾 Direct download of cleaned videos
- 🎨 Beautiful, responsive UI with Tailwind CSS
- ⚡ Fast processing with AI API integration
- 🔒 Secure file handling with automatic cleanup

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download this project

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
copy .env.example .env
```

4. (Optional) Add your API key to `.env`:
```
KIE_API_KEY=your_api_key_here
```

Get a free API key from: https://kie.ai/sora-2-watermark-remover

### Running the Application

1. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:4000
```

## 📖 Usage

1. **Upload Video**: Drag and drop a video file or click "Browse Files"
2. **Process**: Click "Remove Watermark" button
3. **Wait**: The AI will process your video (this may take a few minutes)
4. **Download**: Once complete, preview and download your clean video

### Supported Formats

- MP4
- MOV
- AVI

### File Size Limit

- Maximum: 200MB per video

## 🛠️ Technical Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Responsive design

### Backend
- Node.js
- Express.js
- Multer (file upload handling)
- node-fetch (API calls)
- CORS enabled

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following:

```env
PORT=4000
KIE_API_KEY=your_api_key_here
```

### API Integration

The app supports multiple API options:

1. **Kie AI Sora 2 API** (Recommended)
   - Free tier available
   - Sign up at: https://kie.ai/sora-2-watermark-remover

2. **Mock Mode** (Testing)
   - If no API key is provided, the app runs in mock mode
   - Returns the original video for testing purposes

## 📁 Project Structure

```
video-watermark-remover/
├── index.html          # Frontend UI
├── styles.css          # Custom CSS styles
├── app.js             # Frontend JavaScript
├── server.js          # Backend server
├── package.json       # Dependencies
├── .env.example       # Environment template
├── README.md          # Documentation
└── uploads/           # Temporary upload directory (auto-created)
```

## 🔒 Security Features

- File type validation
- File size limits
- Automatic cleanup of temporary files
- CORS protection
- Secure file handling

## 🚀 Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set environment variables in Render dashboard
4. Deploy!

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set KIE_API_KEY=your_api_key_here
git push heroku main
```

### Deploy to Vercel/Netlify

For serverless deployment, you'll need to adapt the backend to serverless functions.

## 🐛 Troubleshooting

### "No API key found" warning
- The app will run in mock mode without an API key
- Add your API key to `.env` for actual watermark removal

### Upload fails
- Check file size (must be under 200MB)
- Verify file format (MP4, MOV, or AVI)
- Ensure server is running

### CORS errors
- Make sure the backend server is running
- Check that `API_URL` in `app.js` matches your server address

## 📝 Notes

- Processing time depends on video length and API response time
- Temporary files are automatically deleted after processing
- Old files (>1 hour) are cleaned up on server restart

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🔗 Resources

- [Kie AI Watermark Remover](https://kie.ai/sora-2-watermark-remover)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)

---

Built with ❤️ using AI technology
