
'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Global variable to hold the client
let supabase: SupabaseClient | null = null;

// Function to get the Supabase client
export const getSupabase = () => {
    // If the client is already created, return it
    if (supabase) {
        return supabase;
    }

    // If not, create it
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check if the environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
        // This will only happen if the function is called in an environment
        // where env vars are not set (like during build time for some pages).
        // It's safer to return null and handle it in the calling code
        // than to throw an error that crashes the build.
        console.error("Supabase credentials are not set. Client cannot be initialized.");
        return null;
    }
    
    // Create and store the client
    supabase = createClient(supabaseUrl, supabaseAnonKey);

    return supabase;
};
