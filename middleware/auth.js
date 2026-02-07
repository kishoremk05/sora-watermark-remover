const { supabase } = require('../services/supabase');

/**
 * Middleware to authenticate user via Supabase JWT token
 * Expects Authorization header with Bearer token
 */
async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'No authorization token provided',
                message: 'Please log in to continue'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            console.error('Authentication error:', error?.message);
            return res.status(401).json({ 
                error: 'Invalid or expired token',
                message: 'Your session has expired. Please log in again.'
            });
        }
        
        // Attach user to request object
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            error: 'Authentication failed',
            message: 'An error occurred during authentication'
        });
    }
}

/**
 * Optional middleware - allows both authenticated and unauthenticated requests
 * If token is present, attaches user to request
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabase.auth.getUser(token);
            
            if (user) {
                req.user = user;
                req.token = token;
            }
        }
        
        next();
    } catch (error) {
        // Don't fail the request, just continue without user
        next();
    }
}

module.exports = { authenticateUser, optionalAuth };
