#!/usr/bin/env ts-node
/**
 * Script to get Google OAuth refresh token for server-side Gmail API access
 * 
 * Usage:
 * 1. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in your .env file
 * 2. Run: pnpm ts-node scripts/get-refresh-token.ts
 * 3. Visit the URL printed in the console
 * 4. Authorize and copy the code from the redirect URL
 * 5. Paste the code when prompted
 * 6. Copy the refresh token to your .env file
 */

import { google } from 'googleapis';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const redirectUri = 'http://localhost:4000/oauth2callback';

if (!clientId || !clientSecret) {
  console.error('❌ Error: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in your .env file');
  console.error('\nPlease add these to your .env file:');
  console.error('GMAIL_CLIENT_ID=your_client_id_here');
  console.error('GMAIL_CLIENT_SECRET=your_client_secret_here');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent', // Force consent screen to get refresh token
});

console.log('\n🔐 Google OAuth Setup\n');
console.log('📋 Step 1: Visit this URL in your browser:');
console.log('\n' + authUrl + '\n');
console.log('📋 Step 2: Sign in with your Google account');
console.log('📋 Step 3: Grant permission for Gmail read-only access');
console.log('📋 Step 4: After authorization, you\'ll be redirected to a URL');
console.log('📋 Step 5: Copy the "code" parameter from the redirect URL\n');
console.log('   Example redirect URL:');
console.log('   http://localhost:4000/oauth2callback?code=4/0A...');
console.log('   Copy everything after "code="\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('📝 Paste the authorization code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      console.error('\n❌ Error: No refresh token received.');
      console.error('This can happen if you\'ve already authorized this app before.');
      console.error('Try revoking access at: https://myaccount.google.com/permissions');
      console.error('Then run this script again.\n');
      rl.close();
      process.exit(1);
    }

    console.log('\n✅ Success! Here are your tokens:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Add this to your .env file:\n');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n💡 Note: Make sure GMAIL_USER_EMAIL is already set in your .env file');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Note: The access token expires, but the refresh token is permanent.');
    console.log('💡 The server will automatically use the refresh token to get new access tokens.\n');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Error getting token:', error);
    rl.close();
    process.exit(1);
  }
});

