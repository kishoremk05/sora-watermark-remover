// Frontend Configuration
// Supabase configuration (public keys only)
const SUPABASE_URL = 'https://uhjdrfmgjciadhoeutkb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoamRyZm1namNpYWRob2V1dGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTA1MDcsImV4cCI6MjA4NjAyNjUwN30.ggYcNfB8x-DPBXhWQbzf7qAbvvyNM1zDJgPGtn63NpU';
const API_URL = window.location.origin;

// Initialize Supabase client (will be available after script loads)
var supabase;

// Initialize when Supabase library is loaded
(function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
    } else {
        console.error('❌ Supabase library not loaded');
    }
})();
