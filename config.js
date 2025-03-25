// Supabase configuration
const SUPABASE_URL = 'https://itukwxjrkjlpimafhhie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0dWt3eGpya2pscGltYWZoaGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTI1NzcsImV4cCI6MjA1ODIyODU3N30.29hEH2ZTIkCgfiVt-2cwJzHw6PeLMdHYf7bfk3sV0nI';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the client
window.supabaseClient = supabaseClient;
