const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env file.');
    process.exit(1);
}

// Anon client for client-side operations (uses RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations (bypasses RLS)
// Only use this for admin operations
const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

console.log('✅ Supabase client initialized');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Admin client: ${supabaseAdmin ? 'Available' : 'Not configured'}`);

module.exports = { supabase, supabaseAdmin };
