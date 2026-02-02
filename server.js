// Node.js Backend Server for Video Watermark Remover

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get the base URL for callbacks (will be set after deployment)
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Debug: Log environment variables
console.log('=== Environment Variables Debug ===');
console.log('PORT:', process.env.PORT);
console.log('KIE_API_KEY:', process.env.KIE_API_KEY ? '***' + process.env.KIE_API_KEY.slice(-4) : 'NOT SET');
console.log('USE_REAL_API:', process.env.USE_REAL_API);
console.log('===================================\n');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve frontend files

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 200 * 1024 * 1024 // 200MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, MOV, and AVI are allowed.'));
        }
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Store for pending tasks (in-memory, use Redis in production for multiple instances)
const pendingTasks = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Callback endpoint for Kie AI
app.post('/api/callback', express.json(), async (req, res) => {
    try {
        const callbackData = req.body;
        console.log('Received callback from Kie AI:', JSON.stringify(callbackData, null, 2));
        
        // Extract task ID from callback data
        let taskId = null;
        if (callbackData.data && callbackData.data.taskId) {
            taskId = callbackData.data.taskId;
        }
        
        if (!taskId) {
            console.error('No taskId in callback data');
            return res.status(400).json({ error: 'No taskId provided' });
        }
        
        // Store the callback result
        pendingTasks.set(taskId, {
            completed: true,
            success: callbackData.code === 200,
            data: callbackData.data,
            timestamp: Date.now()
        });
        
        console.log(`✅ Callback stored for task: ${taskId}`);
        
        // Acknowledge receipt
        res.json({ received: true, taskId });
        
    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).json({ error: 'Failed to process callback' });
    }
});

// Endpoint to check task status (for frontend polling)
app.get('/api/task/:taskId', (req, res) => {
    const { taskId } = req.params;
    const taskData = pendingTasks.get(taskId);
    
    if (!taskData) {
        return res.status(404).json({ 
            status: 'pending',
            message: 'Task not completed yet' 
        });
    }
    
    if (taskData.success && taskData.data.state === 'success') {
        const resultJson = JSON.parse(taskData.data.resultJson);
        const originalUrl = resultJson.resultUrls[0];
        // Return proxy URL to bypass CORS
        return res.json({
            status: 'completed',
            videoUrl: `/api/download/${taskId}`,
            originalUrl: originalUrl
        });
    }
    
    if (taskData.data.state === 'fail') {
        return res.status(500).json({
            status: 'failed',
            error: taskData.data.failMsg || 'Processing failed'
        });
    }
    
    res.json({ status: 'processing' });
});

// Video proxy endpoint - downloads video from Kie AI and serves it (bypasses CORS)
app.get('/api/download/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const taskData = pendingTasks.get(taskId);
        
        if (!taskData || !taskData.success || taskData.data.state !== 'success') {
            return res.status(404).json({ error: 'Video not found or not ready' });
        }
        
        const resultJson = JSON.parse(taskData.data.resultJson);
        const videoUrl = resultJson.resultUrls[0];
        
        console.log(`📥 Proxying video download for task: ${taskId}`);
        console.log(`   Source URL: ${videoUrl}`);
        
        // Fetch video from Kie AI server
        const videoResponse = await fetch(videoUrl);
        
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.status}`);
        }
        
        // Get content type and length
        const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
        const contentLength = videoResponse.headers.get('content-length');
        
        // Set headers for video download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'attachment; filename="clean_sora_video.mp4"');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        }
        
        // Stream the video to client
        const buffer = await videoResponse.buffer();
        console.log(`✅ Video download complete: ${buffer.length} bytes`);
        res.send(buffer);
        
    } catch (error) {
        console.error('Error proxying video:', error);
        res.status(500).json({ error: 'Failed to download video', details: error.message });
    }
});

// Helper function to download video from URL
async function downloadVideo(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to download processed video');
    }
    return await response.buffer();
}

// Main watermark removal endpoint - accepts Sora video URL
app.post('/api/remove-watermark', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        
        if (!videoUrl) {
            return res.status(400).json({ error: 'No video URL provided' });
        }
        
        // Validate Sora URL
        if (!videoUrl.startsWith('https://sora.chatgpt.com/')) {
            return res.status(400).json({ 
                error: 'Invalid Sora URL. Must start with https://sora.chatgpt.com/' 
            });
        }
        
        console.log(`Processing Sora video: ${videoUrl}`);
        
        // Check if we should use real API or mock mode
        const useRealAPI = process.env.KIE_API_KEY && process.env.USE_REAL_API === 'true';
        
        if (useRealAPI) {
            console.log('Using real Kie AI API...');
            try {
                // Try the playground endpoint first (simpler, might be synchronous)
                console.log('Attempting playground endpoint...');
                console.log('Video URL:', videoUrl);
                
                const playgroundResponse = await fetch('https://api.kie.ai/api/playground/run', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'sora-watermark-remover',
                        input: {
                            video_url: videoUrl
                        }
                    })
                });
                
                console.log('Playground Response Status:', playgroundResponse.status);
                const playgroundResult = await playgroundResponse.json();
                console.log('Playground Response:', JSON.stringify(playgroundResult, null, 2));
                
                if (playgroundResponse.ok && playgroundResult.resultUrls && playgroundResult.resultUrls.length > 0) {
                    // Direct result!
                    const cleanVideoUrl = playgroundResult.resultUrls[0];
                    console.log(`Clean video URL: ${cleanVideoUrl}`);
                    
                    const videoBuffer = await downloadVideo(cleanVideoUrl);
                    res.setHeader('Content-Type', 'video/mp4');
                    res.setHeader('Content-Disposition', 'attachment; filename="clean_video.mp4"');
                    res.send(videoBuffer);
                    return;
                }
                
                // If playground doesn't work, fall back to job API
                console.log('Playground endpoint not available, using job API...');
                throw new Error('Playground endpoint not supported, trying job API');
                
            } catch (playgroundError) {
                console.log('Playground attempt failed:', playgroundError.message);
                console.log('Falling back to async job API...');
                
                try {
                    // Use the async job API with callback
                    const callbackUrl = `${BASE_URL}/api/callback`;
                    
                    console.log('Creating task with callback URL:', callbackUrl);
                    
                    const taskResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'sora-watermark-remover',
                            callBackUrl: callbackUrl,
                            input: {
                                video_url: videoUrl
                            }
                        })
                    });
                    
                    const taskResult = await taskResponse.json();
                    console.log('Task creation response:', JSON.stringify(taskResult, null, 2));
                    
                    if (taskResult.code !== 200 || !taskResult.data || !taskResult.data.taskId) {
                        // Handle specific error codes
                        if (taskResult.code === 402) {
                            throw new Error('Insufficient credits. Please add credits to your Kie AI account at https://kie.ai/dashboard');
                        }
                        throw new Error(taskResult.msg || taskResult.message || 'Failed to create task');
                    }
                    
                    const taskId = taskResult.data.taskId;
                    console.log(`✅ Task created successfully: ${taskId}`);
                    console.log('⏳ Waiting for callback from Kie AI...');
                    
                    // Initialize task tracking
                    pendingTasks.set(taskId, {
                        completed: false,
                        timestamp: Date.now()
                    });
                    
                    // Return task ID for frontend to poll
                    return res.status(202).json({
                        success: true,
                        message: 'Task created successfully! Processing your video...',
                        taskId: taskId,
                        pollUrl: `/api/task/${taskId}`,
                        estimatedTime: '10-30 seconds'
                    });
                    
                } catch (jobError) {
                    console.error('Job API also failed:', jobError.message);
                    throw jobError;
                }
            }
        }
        
        // Mock processing mode (default)
        console.log('Using mock processing mode');
        console.log('To use real API: Set USE_REAL_API=true in .env file');
        
        return res.status(400).json({ 
            error: 'Mock mode enabled. Please provide a valid API key and set USE_REAL_API=true',
            details: 'The app is currently in demo mode and cannot process real videos'
        });
        
    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 200MB limit' });
        }
        return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${path.resolve('uploads')}`);
    console.log(`🔑 API Key configured: ${process.env.KIE_API_KEY ? 'Yes' : 'No'}`);
    console.log(`🤖 Mode: ${process.env.USE_REAL_API === 'true' ? 'Real API (Synchronous)' : 'Mock'}`);
    console.log(`\n✨ Ready to remove watermarks from Sora videos!`);
    console.log(`📝 Paste a Sora video URL and click "Remove Watermark"\n`);
});

// Cleanup old files on startup
const cleanupUploads = () => {
    const uploadsDir = 'uploads';
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            const now = Date.now();
            const fileAge = now - stats.mtimeMs;
            
            // Delete files older than 1 hour
            if (fileAge > 3600000) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up old file: ${file}`);
            }
        });
    }
};

cleanupUploads();
