require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

async function testAuth() {
    try {
        console.log('Testing Authentication Routes...\n');

        // Test Signup
        console.log('1. Testing Signup...');
        const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
            email: `test${Date.now()}@example.com`,
            password: 'Test123!@#'
        });
        console.log('Signup Success:', signupResponse.data);
        console.log('----------------------------------------\n');

        // Test Login
        console.log('2. Testing Login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: signupResponse.data.user.email,
            password: 'Test123!@#'
        });
        authToken = loginResponse.data.session.access_token;
        console.log('Login Success:', loginResponse.data);
        console.log('----------------------------------------\n');

        // Test Get Profile
        console.log('3. Testing Get Profile...');
        const profileResponse = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Profile Success:', profileResponse.data);
        console.log('----------------------------------------\n');

        console.log('All Authentication Tests Passed! ✅');
        return authToken;

    } catch (error) {
        console.error('Authentication Test Failed ❌');
        console.error('Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

module.exports = { testAuth };

// Run the test if this file is run directly
if (require.main === module) {
    testAuth();
}
