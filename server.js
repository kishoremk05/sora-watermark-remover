// Node.js Backend Server for Video Watermark Remover

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Supabase and services
const { supabase } = require('./services/supabase');
const { authenticateUser, optionalAuth } = require('./middleware/auth');
const { 
    checkUserCredits, 
    deductCredit, 
    getUserSubscriptionSummary,
    createSubscription 
} = require('./services/credits');

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

// ============================================
// USER & SUBSCRIPTION MANAGEMENT ENDPOINTS
// ============================================

// Get current user profile
app.get('/api/user/profile', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, profile: data });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get user's subscription and credits
app.get('/api/user/subscription', authenticateUser, async (req, res) => {
    try {
        const summary = await getUserSubscriptionSummary(req.user.id);
        res.json({ success: true, ...summary });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

// Get user's video processing history
app.get('/api/user/history', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('video_processing_history')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        res.json({ success: true, history: data });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get all available subscription plans
app.get('/api/plans', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true });
        
        if (error) throw error;
        
        res.json({ success: true, plans: data });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// Purchase a subscription plan
app.post('/api/purchase', authenticateUser, async (req, res) => {
    try {
        const { planId, paymentId } = req.body;
        
        if (!planId) {
            return res.status(400).json({ error: 'Plan ID is required' });
        }
        
        // TODO: Integrate with actual payment provider
        // For now, we'll create the subscription directly
        // In production, verify payment first before creating subscription
        
        const subscription = await createSubscription(req.user.id, planId, paymentId);
        
        res.json({ 
            success: true, 
            message: 'Subscription created successfully',
            subscription 
        });
    } catch (error) {
        console.error('Error purchasing plan:', error);
        res.status(500).json({ error: 'Failed to purchase plan' });
    }
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
app.post('/api/remove-watermark', authenticateUser, async (req, res) => {
    let historyId = null;
    let subscriptionId = null;
    
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
        
        // Check if user has credits
        const { hasCredits, subscription } = await checkUserCredits(req.user.id);
        
        if (!hasCredits || !subscription) {
            return res.status(403).json({ 
                error: 'Insufficient credits',
                message: 'You need to purchase a plan to remove watermarks. Visit the pricing page to get started.',
                needsPurchase: true
            });
        }
        
        subscriptionId = subscription.id;
        console.log(`User ${req.user.email} has ${subscription.credits_remaining} credits remaining`);
        
        // Create processing history entry
        const { data: historyEntry, error: historyError } = await supabase
            .from('video_processing_history')
            .insert({
                user_id: req.user.id,
                subscription_id: subscriptionId,
                video_url: videoUrl,
                status: 'processing'
            })
            .select()
            .single();
        
        if (historyError) {
            console.error('Error creating history entry:', historyError);
        } else {
            historyId = historyEntry.id;
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
                    // Direct result! Deduct credit and update history
                    const cleanVideoUrl = playgroundResult.resultUrls[0];
                    console.log(`Clean video URL: ${cleanVideoUrl}`);
                    
                    // Deduct credit
                    await deductCredit(subscriptionId);
                    
                    // Update history
                    if (historyId) {
                        await supabase
                            .from('video_processing_history')
                            .update({
                                status: 'completed',
                                processed_video_url: cleanVideoUrl,
                                processing_completed_at: new Date().toISOString()
                            })
                            .eq('id', historyId);
                    }
                    
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
                    
                    // Deduct credit immediately when task is created
                    await deductCredit(subscriptionId);
                    
                    // Initialize task tracking with user and history info
                    pendingTasks.set(taskId, {
                        completed: false,
                        timestamp: Date.now(),
                        userId: req.user.id,
                        historyId: historyId
                    });
                    
                    // Update history with task ID
                    if (historyId) {
                        await supabase
                            .from('video_processing_history')
                            .update({ task_id: taskId })
                            .eq('id', historyId);
                    }
                    
                    // Return task ID for frontend to poll
                    return res.status(202).json({
                        success: true,
                        message: 'Task created successfully! Processing your video...',
                        taskId: taskId,
                        pollUrl: `/api/task/${taskId}`,
                        estimatedTime: '10-30 seconds',
                        creditsRemaining: subscription.credits_remaining - 1
                    });
                    
                } catch (jobError) {
                    console.error('Job API also failed:', jobError.message);
                    
                    // Update history as failed
                    if (historyId) {
                        await supabase
                            .from('video_processing_history')
                            .update({
                                status: 'failed',
                                error_message: jobError.message,
                                processing_completed_at: new Date().toISOString()
                            })
                            .eq('id', historyId);
                    }
                    
                    throw jobError;
                }
            }
        }
        
        // Mock processing mode (default)
        console.log('Using mock processing mode');
        console.log('To use real API: Set USE_REAL_API=true in .env file');
        
        // Update history as failed in mock mode
        if (historyId) {
            await supabase
                .from('video_processing_history')
                .update({
                    status: 'failed',
                    error_message: 'Mock mode enabled',
                    processing_completed_at: new Date().toISOString()
                })
                .eq('id', historyId);
        }
        
        return res.status(400).json({ 
            error: 'Mock mode enabled. Please provide a valid API key and set USE_REAL_API=true',
            details: 'The app is currently in demo mode and cannot process real videos'
        });
        
    } catch (error) {
        console.error('Error processing video:', error);
        
        // Update history as failed if we have a history ID
        if (historyId) {
            await supabase
                .from('video_processing_history')
                .update({
                    status: 'failed',
                    error_message: error.message,
                    processing_completed_at: new Date().toISOString()
                })
                .eq('id', historyId);
        }
        
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
