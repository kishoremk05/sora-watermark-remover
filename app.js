// ===== SoraClean — Frontend App =====

// API URL detection
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

// ===== THEME TOGGLE =====
(function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle || !icon) return;

    function updateIcon() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    updateIcon();

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcon();
    });
})();


// ===== MOBILE MENU =====
(function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('active');
        btn.classList.toggle('active');
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            btn.classList.remove('active');
        });
    });
})();


// ===== SCROLL ANIMATIONS =====
(function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.anim-slide-up, .anim-fade-in').forEach(el => {
        observer.observe(el);
    });
})();


// ===== PASTE BUTTON (Hero) =====
(function initPasteButton() {
    const pasteBtn = document.getElementById('pasteBtn');
    const input = document.getElementById('heroVideoUrl');
    if (!pasteBtn || !input) return;

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            input.value = text;
            input.focus();
            // Flash feedback
            pasteBtn.innerHTML = '<i class="fas fa-check"></i><span>Pasted!</span>';
            pasteBtn.style.color = 'var(--success)';
            setTimeout(() => {
                pasteBtn.innerHTML = '<i class="fas fa-paste"></i><span>Paste</span>';
                pasteBtn.style.color = '';
            }, 1500);
        } catch (e) {
            // Fallback: just focus
            input.focus();
        }
    });
})();


// ===== CONTACT FORM =====
(function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
        form.reset();
    });
})();


// ===== HERO VIDEO PROCESSING (Landing Page) =====
(function initHeroProcessing() {
    const processBtn = document.getElementById('heroProcessBtn');
    const urlInput = document.getElementById('heroVideoUrl');
    const uploadBox = document.getElementById('heroUploadBox');
    const processingEl = document.getElementById('heroProcessing');
    const resultEl = document.getElementById('heroResult');
    const errorEl = document.getElementById('heroError');
    const progressBar = document.getElementById('heroProgressBar');
    const progressText = document.getElementById('heroProgressText');
    const resultVideo = document.getElementById('heroResultVideo');
    const downloadBtn = document.getElementById('heroDownloadBtn');
    const processAnother = document.getElementById('heroProcessAnother');
    const retryBtn = document.getElementById('heroRetryBtn');
    const errorMessage = document.getElementById('heroErrorMessage');

    // Exit if not on the landing page
    if (!processBtn || !urlInput) return;

    function showSection(section) {
        [uploadBox, processingEl, resultEl, errorEl].forEach(el => {
            if (el) el.classList.add('hidden');
        });
        if (section) section.classList.remove('hidden');
    }

    function updateProgress(percent) {
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = Math.round(percent) + '%';
    }

    function showError(msg) {
        if (errorMessage) errorMessage.textContent = msg;
        showSection(errorEl);
        if (uploadBox) uploadBox.classList.remove('hidden');
    }

    function showSuccess(videoUrl) {
        if (resultVideo) resultVideo.src = videoUrl;
        if (downloadBtn) {
            downloadBtn.href = videoUrl;
            downloadBtn.download = 'clean_sora_video.mp4';
        }
        showSection(resultEl);
    }

    // Process button click
    processBtn.addEventListener('click', async () => {
        const videoUrl = urlInput.value.trim();

        if (!videoUrl) {
            showError('Please enter a Sora video URL');
            return;
        }

        if (!videoUrl.startsWith('https://sora.chatgpt.com/')) {
            showError('Invalid URL. Must start with https://sora.chatgpt.com/');
            return;
        }

        // Check authentication before processing
        const session = await checkAuth();
        if (!session) {
            // Save video URL for after login
            localStorage.setItem('pendingVideoUrl', videoUrl);
            // Redirect to login with return URL
            window.location.href = '/login?redirect=dashboard&action=process';
            return;
        }

        showSection(processingEl);
        updateProgress(0);

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 5;
            if (progress > 90) progress = 90;
            updateProgress(progress);
        }, 1000);

        try {
            const response = await fetch(`${API_BASE}/remove-watermark`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ videoUrl })
            });

            clearInterval(progressInterval);
            updateProgress(100);

            const result = await response.json();

            if (response.status === 202 && result.taskId) {
                // Poll for result
                const maxAttempts = 60;
                const pollDelay = 2000;

                for (let i = 0; i < maxAttempts; i++) {
                    await new Promise(r => setTimeout(r, pollDelay));
                    try {
                        const pollRes = await fetch(`${API_BASE}/task/${result.taskId}`, {
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`
                            }
                        });
                        const pollData = await pollRes.json();

                        if (pollData.status === 'completed' && pollData.videoUrl) {
                            showSuccess(pollData.videoUrl);
                            return;
                        }
                        if (pollData.status === 'failed') {
                            throw new Error(pollData.error || 'Processing failed');
                        }
                    } catch (pollErr) {
                        console.error('Poll error:', pollErr);
                    }
                }

                // Timeout fallback
                if (errorMessage) {
                    errorMessage.innerHTML = `
                        Task created successfully (ID: <code style="font-size:12px;background:var(--bg-tertiary);padding:2px 6px;border-radius:4px;">${result.taskId}</code>). 
                        Processing is taking longer than expected. 
                        ${result.dashboardUrl ? `<a href="${result.dashboardUrl}" target="_blank" style="color:var(--accent);font-weight:600;">Open Kie AI Dashboard →</a>` : ''}
                    `;
                }
                showSection(errorEl);
                if (uploadBox) uploadBox.classList.remove('hidden');
                return;
            }

            if (!response.ok) {
                // Check for specific error codes
                if (response.status === 401) {
                    // Token expired or invalid, redirect to login
                    localStorage.setItem('pendingVideoUrl', videoUrl);
                    window.location.href = '/login?redirect=dashboard&action=process';
                    return;
                }
                if (response.status === 403 && result.needsPurchase) {
                    // No credits, redirect to pricing
                    showError(result.message || 'Insufficient credits. Please purchase a plan to continue.');
                    return;
                }
                throw new Error(result.error || result.details || 'Failed to process video');
            }

            throw new Error('Unexpected response from server. Please try again.');

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Error:', error);
            showError(error.message || 'An error occurred. Please try again.');
        }
    });

    // Process another
    if (processAnother) {
        processAnother.addEventListener('click', () => {
            urlInput.value = '';
            if (resultVideo) resultVideo.src = '';
            updateProgress(0);
            showSection(uploadBox);
        });
    }

    // Retry
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            showSection(uploadBox);
        });
    }
})();


// ===== AUTH NAVIGATION UPDATE =====
document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateNavigation === 'function') {
        updateNavigation();
    }
});
