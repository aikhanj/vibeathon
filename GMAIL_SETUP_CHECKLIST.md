# 📋 Gmail Setup Checklist

Use this simple checklist to enable Gmail in your TigerSwipe app!

## ✅ Setup Steps (5 minutes)

### 1. Configure Clerk Dashboard

- [ ] Go to https://dashboard.clerk.com
- [ ] Navigate to: **User & Authentication** → **Social Connections**
- [ ] Click on **Google** provider
- [ ] In the **Scopes** section, add: `https://www.googleapis.com/auth/gmail.readonly`
- [ ] Verify these scopes are also present:
  - [ ] `openid`
  - [ ] `email`
  - [ ] `profile`
- [ ] Click **Save**

### 2. Re-authenticate

- [ ] In your app, click **Sign Out**
- [ ] Click **Sign in with Google**
- [ ] You should see a consent screen requesting Gmail access
- [ ] Grant the permission
- [ ] You should now be signed in

### 3. Verify It's Working

Choose one of these methods:

#### Method A: Check Server Logs (Easiest)

- [ ] Look at your server terminal
- [ ] You should see: `✅ Using Gmail emails via Clerk OAuth token`
- [ ] And: `📧 Fetching emails from Gmail...`
- [ ] If you see `⚠️ Using MOCK emails`, something is wrong (see troubleshooting)

#### Method B: Check API Response

- [ ] Open browser DevTools → Network tab
- [ ] Refresh the page
- [ ] Find the `/api/cards` request
- [ ] Check the response - `_meta.emailSource` should be `"gmail-clerk"`

#### Method C: Use Diagnostic Endpoint

- [ ] Open: http://localhost:4000/api/cards/gmail-status
- [ ] Verify `hasAccessToken: true` and `emailSource: "gmail"`

### 4. Celebrate! 🎉

- [ ] The status banner should disappear
- [ ] You should see your real Gmail emails as cards
- [ ] Swipe away! 🐯

---

## 🐛 Troubleshooting

### Problem: Still seeing mock emails

**Check the server logs** for the exact issue:

| Log Message                  | Issue                | Solution                             |
| ---------------------------- | -------------------- | ------------------------------------ |
| `⚠️ Using MOCK emails`       | Gmail not connected  | Follow checklist steps 1-2           |
| `Gmail scope not found`      | Scope not added      | Add scope in Clerk, then sign out/in |
| `No Google external account` | Wrong sign-in method | Use "Sign in with Google" button     |
| `CLERK_SECRET_KEY not set`   | Missing env var      | Add to `.env` file                   |

### Problem: Gmail API errors (401 Unauthorized)

- [ ] Enable Gmail API in Google Cloud Console:
  1. Go to https://console.cloud.google.com/
  2. Navigate to **APIs & Services** → **Library**
  3. Search for "Gmail API"
  4. Click **Enable**

### Problem: Consent screen not showing Gmail permission

- [ ] The Gmail scope wasn't added in Clerk Dashboard
- [ ] Go back to Step 1 and verify the scope is there
- [ ] Sign out and sign back in

---

## 📊 What Success Looks Like

### Server Logs (Good ✅)

```
✅ Using Gmail emails via Clerk OAuth token
📧 Fetching emails from Gmail using OAuth access token...
✅ Successfully fetched 42 emails from Gmail
🤖 Classifying 42 emails with Claude...
✨ 28 event cards created (14 emails filtered out)
```

### Server Logs (Needs Fix ⚠️)

```
⚠️ Using MOCK emails (no Gmail access token available)
   To use real Gmail:
   1. Add https://www.googleapis.com/auth/gmail.readonly scope in Clerk Dashboard
   2. Sign out and sign back in to reauthorize
📝 Using mock emails (no Gmail configuration available)
```

### API Response (Good ✅)

```json
{
  "data": [...],
  "_meta": {
    "emailSource": "gmail-clerk",
    "totalCards": 28
  }
}
```

### Diagnostic Endpoint (Good ✅)

```json
{
  "isAuthenticated": true,
  "userId": "user_2abc...",
  "clerkConfigured": true,
  "gmailServerConfigured": false,
  "hasAccessToken": true,
  "emailSource": "gmail"
}
```

---

## 📚 Need More Help?

- **Quick Start Guide**: `GMAIL_SETUP_QUICK_START.md`
- **Full Instructions**: `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md`
- **Technical Summary**: `GMAIL_INTEGRATION_SUMMARY.md`

---

## ⏱️ Estimated Time: 5 minutes

That's it! Your app is ready to use real Gmail emails. Just follow the checklist and you're done! 🚀
