require('dotenv').config();
const { supabase, testConnection } = require('../config/supabase');

async function waitForUser(email, maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (data) return data;
        if (error && !error.message.includes('no rows')) throw error;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Timeout waiting for user creation');
}

async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase Connection...\n');
        
        // Test basic connection
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Failed to establish connection with Supabase');
        }

        // Test authentication
        console.log('\nTesting Authentication...');
        const email = `test${Date.now()}@example.com`;
        const password = 'Test123!@#';
        
        // Sign up
        const signUpResponse = await supabase.auth.signUp({
            email,
            password
        });

        if (signUpResponse.error) throw signUpResponse.error;
        console.log('Sign up successful:', signUpResponse.data.user.email);

        // Test login
        const signInResponse = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInResponse.error) throw signInResponse.error;
        console.log('Sign in successful');

        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        console.log('Session retrieved successfully');

        // Test video operations
        console.log('\nTesting Video Operations...');
        
        // Wait for user to be created and get user data
        console.log('Waiting for user record to be created...');
        const userData = await waitForUser(email);
        console.log('User retrieved successfully:', userData.email);
        
        // Insert a test video
        const videoData = {
            title: 'Test Video',
            description: 'A test video entry',
            url: 'https://example.com/test-video.mp4',
            thumbnail_url: 'https://example.com/test-thumbnail.jpg',
            user_id: userData.id,
            public: true
        };

        const { data: video, error: videoError } = await supabase
            .from('videos')
            .insert([videoData])
            .select()
            .single();

        if (videoError) throw videoError;
        console.log('Video insert successful:', video.title);

        // Query videos
        const { data: videos, error: queryError } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', userData.id);

        if (queryError) throw queryError;
        console.log('Video query successful. Found', videos.length, 'videos');

        // Clean up - Delete test video
        const { error: deleteError } = await supabase
            .from('videos')
            .delete()
            .eq('id', video.id);

        if (deleteError) throw deleteError;
        console.log('Video deletion successful');

        // Sign out
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        console.log('Sign out successful');

        console.log('\nAll Supabase tests passed successfully! ');
        
    } catch (error) {
        console.error('\nSupabase Test Failed ');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the test
testSupabaseConnection();
