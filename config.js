// Supabase configuration
const SUPABASE_URL = 'https://itukwxjrkjlpimafhhie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0dWt3eGpya2pscGltYWZoaGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTI1NzcsImV4cCI6MjA1ODIyODU3N30.29hEH2ZTIkCgfiVt-2cwJzHw6PeLMdHYf7bfk3sV0nI';

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
