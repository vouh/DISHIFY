// Supabase configuration
const SUPABASE_URL = 'https://haqylpxmjxlfhicaldrp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcXlscHhtanhsZmhpY2FsZHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODY2OTQsImV4cCI6MjA1OTI2MjY5NH0.K9JOcocrquk_IwGu1LK0hNLKDRPyygXjpwGop4LfKlU';

// Initialize Supabase client with better error handling
if (!window.supabaseClient) {
    try {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('Supabase client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
    }
}

// Test connection
async function testSupabaseConnection() {
    try {
        const { error } = await window.supabaseClient.from('profiles').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase connection error:', error.message);
        return false;
    }
}

// Run connection test when page loads
document.addEventListener('DOMContentLoaded', testSupabaseConnection);
