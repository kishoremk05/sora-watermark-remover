// Frontend JavaScript for Video Watermark Remover

// Detect if we're in production or development
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

// DOM Elements
const videoUrlInput = document.getElementById('videoUrlInput');
const processBtn = document.getElementById('processBtn');
const uploadSection = document.getElementById('uploadSection');
const processingSection = document.getElementById('processingSection');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const resultVideo = document.getElementById('resultVideo');
const downloadBtn = document.getElementById('downloadBtn');
const processAnotherBtn = document.getElementById('processAnotherBtn');
const retryBtn = document.getElementById('retryBtn');

// Validate Sora URL
function validateSoraUrl(url) {
    if (!url || url.trim() === '') {
        showError('Please enter a Sora video URL');
        return false;
    }
    
    if (!url.startsWith('https://sora.chatgpt.com/')) {
        showError('Invalid URL. Must be a Sora video URL starting with https://sora.chatgpt.com/');
        return false;
    }
    
    return true;
}

// Show error
function showError(message) {
    errorMessage.innerHTML = message;
    errorSection.classList.remove('hidden');
    errorSection.classList.remove('bg-green-50', 'border-green-200');
    errorSection.classList.add('bg-red-50', 'border-red-200');
    processingSection.classList.add('hidden');
}

// Update progress
function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressText.textContent = Math.round(percent) + '%';
}

// Process video
async function processVideo() {
    const videoUrl = videoUrlInput.value.trim();
    
    if (!validateSoraUrl(videoUrl)) return;
    
    // Hide all sections, show processing
    uploadSection.classList.add('hidden');
    processingSection.classList.remove('hidden');
    errorSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress > 90) progress = 90;
        updateProgress(progress);
    }, 1000);
    
    try {
        const response = await fetch(`${API_URL}/remove-watermark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl })
        });
        
        clearInterval(progressInterval);
        updateProgress(100);
        
        const result = await response.json();
        
        // Check if it's a 202 (task created, now poll for result)
        if (response.status === 202 && result.taskId) {
            console.log('Task created, polling for result...');
            
            // Poll for task completion
            const pollForResult = async () => {
                const maxAttempts = 60; // 2 minutes max
                const pollInterval = 2000; // 2 seconds
                
                for (let i = 0; i < maxAttempts; i++) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    
                    try {
                        const pollResponse = await fetch(`${API_URL}/task/${result.taskId}`);
                        const pollResult = await pollResponse.json();
                        
                        console.log(`Poll attempt ${i + 1}: ${pollResult.status}`);
                        
                        if (pollResult.status === 'completed' && pollResult.videoUrl) {
                            // Success! Video is ready
                            console.log('Video ready:', pollResult.videoUrl);
                            
                            // Use the proxy URL directly - no need to fetch as blob
                            // The server proxies the video, so we can use it directly
                            const videoURL = pollResult.videoUrl;
                            
                            // Show result
                            resultVideo.src = videoURL;
                            downloadBtn.href = videoURL;
                            downloadBtn.download = 'clean_sora_video.mp4';
                            
                            processingSection.classList.add('hidden');
                            resultSection.classList.remove('hidden');
                            return;
                        }
                        
                        if (pollResult.status === 'failed') {
                            throw new Error(pollResult.error || 'Processing failed');
                        }
                        
                    } catch (pollError) {
                        console.error('Poll error:', pollError);
                    }
                }
                
                // Timeout - show dashboard link
                throw new Error('Processing timeout. Please check Kie AI dashboard.');
            };
            
            try {
                await pollForResult();
            } catch (pollError) {
                processingSection.classList.add('hidden');
                
                // Show fallback message with dashboard link
                errorMessage.innerHTML = `
                <div class="text-center">
                    <svg class="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">✨ Task Created Successfully!</h3>
                    <p class="text-gray-700 mb-4">Your video is being processed by Kie AI.</p>
                    
                    <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                        <p class="font-semibold text-blue-900 mb-2">📋 Task ID:</p>
                        <code class="text-sm text-blue-700 bg-white px-3 py-1 rounded break-all">${result.taskId}</code>
                    </div>
                    
                    <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                        <p class="text-sm text-purple-800">
                            <strong>⏱️ Estimated processing time:</strong> ${result.estimatedTime || '10-30 seconds'}
                        </p>
                    </div>
                    
                    <a href="${result.dashboardUrl}" target="_blank" 
                       class="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 mb-4 shadow-lg">
                        🌐 Open Kie AI Dashboard
                    </a>
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 text-left">
                        <p class="text-sm text-gray-700 mb-2">
                            <strong>📝 Instructions:</strong>
                        </p>
                        <ol class="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                            <li>Click the button above to open your Kie AI dashboard</li>
                            <li>Find your task using the Task ID shown above</li>
                            <li>Download your watermark-free video (ready in ~${result.estimatedTime || '30 seconds'})</li>
                        </ol>
                    </div>
                    
                    <p class="text-xs text-gray-400 mt-4 italic">
                        💡 Note: Kie AI's query endpoints are not publicly accessible, so results must be retrieved from the dashboard.
                    </p>
                </div>
                `;
                errorSection.classList.remove('hidden');
                errorSection.classList.remove('bg-red-50', 'border-red-200');
                errorSection.classList.add('bg-green-50', 'border-green-200');
                uploadSection.classList.remove('hidden');
                return;
            }
        }
        
        // If not 202 and not ok, it's an error
        if (!response.ok) {
            throw new Error(result.error || result.details || 'Failed to process video');
        }
        
        // If we get here, we have a video blob (200 response)
        const blob = await response.blob();
        const resultURL = URL.createObjectURL(blob);
        
        // Show result
        resultVideo.src = resultURL;
        downloadBtn.href = resultURL;
        downloadBtn.download = 'clean_sora_video.mp4';
        
        processingSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Error:', error);
        showError(error.message || 'An error occurred while processing your video. Please try again.');
        uploadSection.classList.remove('hidden');
    }
}

// Process button handler
processBtn.addEventListener('click', processVideo);

// Process another video
processAnotherBtn.addEventListener('click', () => {
    videoUrlInput.value = '';
    resultSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    resultVideo.src = '';
    updateProgress(0);
    errorSection.classList.add('hidden');
});

// Retry button
retryBtn.addEventListener('click', () => {
    errorSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
});
