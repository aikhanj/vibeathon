# Gmail Integration Flow

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SIGNS IN                                │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Click "Sign in    │
         │  with Google"      │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Google OAuth      │
         │  Consent Screen    │
         │  - Profile         │
         │  - Email           │
         │  - Gmail (read)    │◄──── Gmail scope must be configured!
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  User grants       │
         │  permissions       │
         └────────┬───────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER LOADS CARDS PAGE                             │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Frontend calls    │
         │  GET /api/cards    │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Server extracts   │
         │  Clerk user ID     │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────────────────────────────┐
         │  Server calls Clerk API to get            │
         │  Google OAuth access token                │
         └────────┬──────────────┬────────────────────┘
                  │              │
      ✅ Success  │              │ ❌ Failed
                  │              │
                  ▼              ▼
         ┌────────────────┐  ┌────────────────┐
         │  Load Gmail    │  │  Load Mock     │
         │  Emails        │  │  Emails        │
         └────────┬───────┘  └────────┬───────┘
                  │                   │
                  └──────────┬────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Claude AI          │
                  │  Classifies Emails  │
                  │  - Event or Club?   │
                  │  - Extract details  │
                  │  - Filter spam      │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Event Cards        │
                  │  Created            │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Return to          │
                  │  Frontend           │
                  └──────────┬──────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER SWIPES CARDS                                 │
│                         🐯✨                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Components

### 1. Clerk (Authentication)

- Manages user authentication
- Handles Google OAuth flow
- Stores OAuth tokens securely
- Provides tokens to your backend via API

### 2. Your Backend (`apps/server`)

- Fetches OAuth token from Clerk
- Calls Gmail API with the token
- Processes emails with Claude AI
- Returns event cards to frontend

### 3. Gmail API

- Provides read-only access to user's emails
- Fetches up to 50 recent emails (configurable)
- Searches: unread OR inbox emails

### 4. Claude AI

- Classifies each email
- Extracts event information
- Filters out spam/irrelevant emails
- Returns structured event data

### 5. Your Frontend (`apps/web`)

- Shows event cards in Tinder-style UI
- Displays status banner if using mock data
- Allows users to swipe and apply

---

## 📊 Data Flow

```
Gmail Inbox
    │
    ├─► Email 1: "Microsoft Summer 2025 Internship"
    ├─► Email 2: "Drama Club Auditions"
    ├─► Email 3: "Your Amazon order has shipped" (filtered out)
    ├─► Email 4: "Coding Workshop - Saturday"
    └─► Email 5: "Newsletter" (filtered out)
         │
         ▼
    Claude AI Classifier
         │
         ├─► Event Card: Microsoft Internship
         ├─► Club Card: Drama Club
         └─► Event Card: Coding Workshop
              │
              ▼
         Frontend UI (Swipeable Cards)
```

---

## 🔒 Security & Privacy

### What the app CAN do:

✅ Read your emails (read-only)
✅ Extract event information
✅ Show you event cards

### What the app CANNOT do:

❌ Delete or modify your emails
❌ Send emails on your behalf
❌ Access other Google services
❌ Store your emails permanently

### Token Security:

- OAuth tokens managed by Clerk (not stored in your DB)
- Tokens automatically refresh when expired
- Users can revoke access anytime from Google Account settings
- HTTPS encryption for all API calls

---

## 🎯 Configuration Points

### Where Gmail Scope is Configured:

1. **Clerk Dashboard** (REQUIRED)

   - Add: `https://www.googleapis.com/auth/gmail.readonly`
   - This tells Google what permissions to request

2. **Google Cloud Console** (if using custom credentials)
   - Enable Gmail API
   - Configure OAuth consent screen
   - Add OAuth credentials to Clerk

### Where Tokens are Used:

1. **Frontend → Backend**

   - Frontend gets Clerk session token
   - Sends to backend with API requests

2. **Backend → Clerk**

   - Backend extracts user ID from session
   - Calls Clerk API to get Google OAuth token

3. **Backend → Gmail**
   - Backend uses Google OAuth token
   - Fetches emails from Gmail API

---

## ⚡ Performance Optimizations

### Caching:

- Server caches cards for 5 minutes (configurable)
- Reduces Gmail API calls
- Faster loading for users

### Parallel Processing:

- All emails classified simultaneously
- Claude API calls run in parallel
- Faster card generation

### Fallback Strategy:

- If Gmail fails → use mock data
- If Clerk fails → use mock data
- App always works, even without Gmail

---

## 🐛 Debug Flow

When things go wrong, follow this debug flow:

```
1. Check frontend console
   ↓
2. Check network tab (/api/cards response)
   ↓
3. Check server logs (emoji indicators)
   ↓
4. Check diagnostic endpoint (/api/cards/gmail-status)
   ↓
5. Check Clerk Dashboard (scope configured?)
   ↓
6. Check Google Cloud Console (API enabled?)
```

---

## 📚 Related Documentation

- **Setup Checklist**: `GMAIL_SETUP_CHECKLIST.md` (start here!)
- **Quick Start**: `GMAIL_SETUP_QUICK_START.md`
- **Full Instructions**: `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md`
- **Summary**: `GMAIL_INTEGRATION_SUMMARY.md`

---

**Questions?** Check the troubleshooting sections in the related docs!
