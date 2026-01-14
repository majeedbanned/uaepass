# UAE PASS Authentication - Next.js Application

A complete UAE PASS authentication implementation using Next.js 16 with App Router, TypeScript, and Tailwind CSS. This application implements the OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange) as per UAE PASS documentation.

## Features

- ✅ Complete OAuth 2.0 Authorization Code Flow with PKCE
- ✅ Secure token exchange and validation
- ✅ ID token signature verification using JWKS
- ✅ CSRF protection using state parameter
- ✅ Nonce validation for ID tokens
- ✅ User profile display
- ✅ Session management with HTTP-only cookies
- ✅ Production-ready security practices
- ✅ Beautiful, modern UI with Tailwind CSS

## Prerequisites

1. **UAE PASS Developer Account**: Register your application with UAE PASS to obtain:
   - Client ID
   - Client Secret
   - Redirect URI configuration

2. **Node.js**: Version 18 or higher

3. **Environment Variables**: Configure your `.env.local` file (see Configuration section)

## Getting Started

### 1. Install Dependencies
704123412345671
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# UAE PASS Client Credentials
UAE_PASS_CLIENT_ID=your_client_id_here
UAE_PASS_CLIENT_SECRET=your_client_secret_here

# Redirect URI (must match UAE PASS portal configuration)
UAE_PASS_REDIRECT_URI=http://localhost:3000/uae-pass/callback

# UAE PASS Endpoints (Sandbox/Staging)
UAE_PASS_AUTHORIZATION_ENDPOINT=https://stg-id.uaepass.ae/idshub/authorize
UAE_PASS_TOKEN_ENDPOINT=https://stg-id.uaepass.ae/idshub/token
UAE_PASS_USERINFO_ENDPOINT=https://stg-id.uaepass.ae/idshub/userinfo
UAE_PASS_JWKS_URI=https://stg-id.uaepass.ae/idshub/.well-known/jwks.json
UAE_PASS_ISSUER=https://stg-id.uaepass.ae/idshub

# Scopes
UAE_PASS_SCOPE=urn:uae:digitalid:profile:general openid profile

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here
```

**For Production**, update the endpoints to:
```env
UAE_PASS_AUTHORIZATION_ENDPOINT=https://id.uaepass.ae/idshub/authorize
UAE_PASS_TOKEN_ENDPOINT=https://id.uaepass.ae/idshub/token
UAE_PASS_USERINFO_ENDPOINT=https://id.uaepass.ae/idshub/userinfo
UAE_PASS_JWKS_URI=https://id.uaepass.ae/idshub/.well-known/jwks.json
UAE_PASS_ISSUER=https://id.uaepass.ae/idshub
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── uae-pass/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page with redirect to UAE PASS
│   │   ├── callback/
│   │   │   └── page.tsx          # OAuth callback handler
│   │   └── profile/
│   │       └── page.tsx          # User profile page
│   ├── actions/
│   │   └── auth.ts               # Server actions (logout)
│   └── page.tsx                  # Home page
├── components/
│   └── ProfileDisplay.tsx        # Profile display component
└── lib/
    ├── uaePass.ts                # UAE PASS helper functions
    └── session.ts                # Session management utilities
```

## Authentication Flow

1. **Login Initiation** (`/uae-pass/login`)
   - User clicks "Sign in with UAE PASS"
   - System generates PKCE pair, state, and nonce
   - User is redirected to UAE PASS authorization endpoint

2. **User Authentication**
   - User authenticates with UAE PASS
   - UAE PASS redirects back to callback URL with authorization code

3. **Callback Handling** (`/uae-pass/callback`)
   - Validates state parameter (CSRF protection)
   - Exchanges authorization code for tokens
   - Validates ID token signature using JWKS
   - Fetches user information
   - Creates session and displays profile

4. **Profile Display** (`/uae-pass/profile`)
   - Shows authenticated user's profile information
   - Provides logout functionality

## Security Features

- **PKCE (Proof Key for Code Exchange)**: Prevents authorization code interception attacks
- **State Parameter**: CSRF protection for OAuth flow
- **Nonce Validation**: Ensures ID token freshness
- **ID Token Verification**: Validates signature, issuer, audience, and expiration
- **HTTP-Only Cookies**: Secure session storage
- **Environment Variables**: All secrets stored securely

## Key Components

### UAE PASS Helper Module (`src/lib/uaePass.ts`)

Core functions for UAE PASS integration:
- `buildAuthorizationUrl()`: Constructs authorization URL with PKCE
- `exchangeCodeForTokens()`: Exchanges code for access and ID tokens
- `validateIdToken()`: Validates ID token signature and claims
- `fetchUserInfo()`: Retrieves user profile from UserInfo endpoint
- `normalizeUserProfile()`: Normalizes user data structure

### Session Management (`src/lib/session.ts`)

Secure session handling:
- `createSession()`: Creates encrypted session
- `getSession()`: Retrieves current session
- `deleteSession()`: Logs out user
- State, nonce, and PKCE verifier storage

## UAE PASS Documentation

For detailed information about UAE PASS integration, refer to:
- [UAE PASS Developer Documentation](https://docs.uaepass.ae/)
- [OAuth 2.0 Authorization Code Flow](https://docs.uaepass.ae/feature-guides/authentication/web-application/1.-obtaining-the-oauth2-access-code)

## Troubleshooting

### Common Issues

1. **"Invalid state parameter"**
   - Ensure cookies are enabled in your browser
   - Check that redirect URI matches exactly

2. **"Token exchange failed"**
   - Verify client ID and secret are correct
   - Ensure PKCE code verifier matches challenge

3. **"ID token validation failed"**
   - Check that JWKS URI is accessible
   - Verify issuer and audience match configuration

## Production Deployment

Before deploying to production:

1. Update environment variables to production endpoints
2. Set `SESSION_SECRET` to a strong, random string
3. Ensure `NODE_ENV=production` is set
4. Configure proper redirect URIs in UAE PASS portal
5. Enable HTTPS (required for secure cookies)

## License

MIT
