// Authentication Utilities

/**
 * Sign in with Google OAuth
 */
async function signInWithGoogle() {
    try {
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard.html`
            }
        });
        
        if (error) throw error;
        
        // OAuth will redirect automatically
    } catch (error) {
        console.error('Error signing in:', error);
        alert('Failed to sign in with Google. Please try again.');
    }
}

/**
 * Sign out current user
 */
async function signOut() {
    try {
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out. Please try again.');
    }
}

/**
 * Check if user is authenticated
 * @returns {Promise<Session|null>}
 */
async function checkAuth() {
    try {
        if (!supabase) {
            console.warn('Supabase client not initialized yet');
            return null;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        return session;
    } catch (error) {
        console.error('Error checking auth:', error);
        return null;
    }
}

/**
 * Get current user
 * @returns {Promise<User|null>}
 */
async function getCurrentUser() {
    try {
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
async function requireAuth() {
    const session = await checkAuth();
    
    if (!session) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return null;
    }
    
    return session;
}

/**
 * Update navigation based on auth state
 */
async function updateNavigation() {
    const session = await checkAuth();
    const authButtons = document.getElementById('authButtons');
    const mobileAuthButtons = document.getElementById('mobileAuthButtons');
    
    if (session) {
        // User is logged in
        const loggedInHtml = `
            <a href="/dashboard" class="btn btn-ghost">Dashboard</a>
            <button onclick="signOut()" class="btn btn-primary"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
        `;
        const mobileLoggedInHtml = `
            <a href="/dashboard" class="btn btn-ghost w-full">Dashboard</a>
            <button onclick="signOut()" class="btn btn-primary w-full">Sign Out</button>
        `;
        if (authButtons) authButtons.innerHTML = loggedInHtml;
        if (mobileAuthButtons) mobileAuthButtons.innerHTML = mobileLoggedInHtml;
    } else {
        // User is not logged in
        const loggedOutHtml = `
            <a href="/login" class="btn btn-ghost">Sign In</a>
            <a href="/login" class="btn btn-primary">Get Started <i class="fas fa-arrow-right"></i></a>
        `;
        const mobileLoggedOutHtml = `
            <a href="/login" class="btn btn-ghost w-full">Sign In</a>
            <a href="/login" class="btn btn-primary w-full">Get Started</a>
        `;
        if (authButtons) authButtons.innerHTML = loggedOutHtml;
        if (mobileAuthButtons) mobileAuthButtons.innerHTML = mobileLoggedOutHtml;
    }
}

// Setup auth state listener when supabase is ready
function setupAuthListener() {
    if (typeof supabase !== 'undefined' && supabase && supabase.auth) {
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN') {
                console.log('User signed in');
            } else if (event === 'SIGNED_OUT') {
                console.log('User signed out');
            }
        });
    } else {
        // Retry after a short delay
        setTimeout(setupAuthListener, 100);
    }
}

// Start trying to setup the listener
setupAuthListener();
