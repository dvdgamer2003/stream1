const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase URL or Anon Key. Please check your .env file.');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'x-my-custom-header': 'video-streaming-app'
        }
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// Test the connection
async function testConnection() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('Supabase connection established successfully');
        return true;
    } catch (error) {
        console.error('Error connecting to Supabase:', error.message);
        return false;
    }
}

// Initialize connection
testConnection();

module.exports = { supabase, testConnection };
