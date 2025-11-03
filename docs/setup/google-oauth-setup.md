# Google OAuth Setup Instructions

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `Hummii Platform`
4. Click "Create"
5. Wait for project creation (should take a few seconds)

## Step 2: Enable Google+ API

1. In left sidebar: "APIs & Services" → "Library"
2. Search for "Google+ API" or "People API"
3. Click on the API and press "Enable"
4. Wait for enablement confirmation

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure OAuth consent screen first:
   - User Type: External
   - App name: Hummii Platform
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
   - Scopes: email, profile (default)
4. Back to "Create OAuth client ID":
   - Application type: **Web application**
   - Name: `Hummii Web OAuth`
   - Authorized JavaScript origins:
     - Development: `http://localhost:3001`
     - Production: `https://hummii.ca`
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/auth/google/callback`
     - Production: `https://api.hummii.ca/auth/google/callback`
5. Click "Create"
6. **IMPORTANT:** Copy and save:
   - **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abc123...`)

## Step 4: Add to Environment Variables

After obtaining Client ID and Secret, add them to your `.env` files:

### Backend (.env)
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL for OAuth redirect
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Step 5: Production Configuration

For production deployment, update the callback URL:

```bash
# Production Backend (.env)
GOOGLE_CALLBACK_URL=https://api.hummii.ca/auth/google/callback
FRONTEND_URL=https://hummii.ca
```

```bash
# Production Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.hummii.ca
```

## Security Notes

- **NEVER** commit `.env` files to version control
- Keep Client Secret confidential
- Use HTTPS in production
- Regularly rotate Client Secret (every 6-12 months)
- Monitor OAuth usage in Google Cloud Console

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that redirect URI in code matches exactly what's in Google Cloud Console
- Include protocol (http/https) and port number
- No trailing slashes

### Error: "access_denied"
- User declined OAuth consent
- Check OAuth consent screen configuration
- Verify scopes are not too broad

### Error: "invalid_client"
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Verify environment variables are loaded properly
- Restart backend after changing .env

## Testing

1. Start backend: `cd api && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to: `http://localhost:3001/login`
4. Click "Continue with Google"
5. Complete Google authentication
6. Should redirect back to your app logged in

---

**Last updated:** November 3, 2025
**Status:** Active

