/**
 * Script to generate a Google OAuth refresh token for Gmail API
 * 
 * Usage:
 * 1. Make sure you have GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in your .env file
 * 2. Run: node scripts/generate-refresh-token.js
 * 3. Follow the instructions to authorize
 * 4. Copy the refresh token to your .env file
 */

const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Gmail readonly scope
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Get credentials from environment
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env file');
  process.exit(1);
}

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost:4000/oauth/callback' // This redirect URL should match your Google Cloud Console
);

// Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // This is important to get a refresh token
  scope: SCOPES,
  prompt: 'consent', // Force consent screen to ensure we get a refresh token
});

console.log('\n📧 Gmail OAuth Refresh Token Generator\n');
console.log('=' .repeat(60));
console.log('\nStep 1: Open this URL in your browser:\n');
console.log(authUrl);
console.log('\nStep 2: Authorize the application');
console.log('\nStep 3: Copy the authorization code from the URL (after "?code=")\n');
console.log('=' .repeat(60));
console.log('');

rl.question('Enter the authorization code here: ', async (code) => {
  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code.trim());
    
    console.log('\n✅ Success! Here are your tokens:\n');
    console.log('=' .repeat(60));
    
    if (tokens.refresh_token) {
      console.log('\n🔑 REFRESH TOKEN (add this to your .env file):\n');
      console.log(tokens.refresh_token);
      console.log('\n⚠️  Important: Save this refresh token securely!');
      console.log('It will not be shown again.\n');
      console.log('Add to your .env file:');
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.warn('\n⚠️  No refresh token received.');
      console.warn('This might happen if you already authorized this app before.');
      console.warn('To fix: Go to https://myaccount.google.com/permissions');
      console.warn('Remove your app, then run this script again.\n');
    }
    
    if (tokens.access_token) {
      console.log('\n🎫 ACCESS TOKEN (temporary, for testing only):');
      console.log(tokens.access_token);
      console.log('\nExpires in:', tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'Unknown');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Error getting tokens:', error.message);
    console.error('\nMake sure:');
    console.error('1. The authorization code is correct');
    console.error('2. The redirect URI in Google Cloud Console matches: http://localhost:4000/oauth/callback');
    console.error('3. Gmail API is enabled in your Google Cloud Project\n');
    rl.close();
    process.exit(1);
  }
});

