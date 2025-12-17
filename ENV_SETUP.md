# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# UAE PASS Client Credentials (obtain from UAE PASS developer portal)
# IMPORTANT: Make sure these are for the STAGING environment if using staging endpoints
UAE_PASS_CLIENT_ID=your_client_id_here
UAE_PASS_CLIENT_SECRET=your_client_secret_here

# Redirect URI - MUST match EXACTLY the one registered in UAE PASS portal
# Including protocol (http/https), domain, port, and path
# No trailing slash!
UAE_PASS_REDIRECT_URI=http://localhost:3000/uae-pass/callback

# UAE PASS Endpoints - Sandbox/Staging (default)
UAE_PASS_AUTHORIZATION_ENDPOINT=https://stg-id.uaepass.ae/idshub/authorize
UAE_PASS_TOKEN_ENDPOINT=https://stg-id.uaepass.ae/idshub/token
UAE_PASS_USERINFO_ENDPOINT=https://stg-id.uaepass.ae/idshub/userinfo
UAE_PASS_JWKS_URI=https://stg-id.uaepass.ae/idshub/.well-known/jwks
UAE_PASS_ISSUER=https://stg-id.uaepass.ae

# Production endpoints (uncomment when ready):
# UAE_PASS_AUTHORIZATION_ENDPOINT=https://id.uaepass.ae/idshub/authorize
# UAE_PASS_TOKEN_ENDPOINT=https://id.uaepass.ae/idshub/token
# UAE_PASS_USERINFO_ENDPOINT=https://id.uaepass.ae/idshub/userinfo
# UAE_PASS_JWKS_URI=https://id.uaepass.ae/idshub/.well-known/jwks
# UAE_PASS_ISSUER=https://id.uaepass.ae

# UAE PASS Scope (standard scope for profile access)
UAE_PASS_SCOPE=urn:uae:digitalid:profile:general

# Session secret for encrypting session data (generate a random string)
# You can generate one using: openssl rand -base64 32
SESSION_SECRET=your_random_session_secret_here
```

## Troubleshooting "Client credentials are invalid"

If you get this error, check:

1. **Correct Environment**: Make sure your client_id and client_secret are for STAGING if using staging endpoints, or PRODUCTION if using production endpoints. They are different!

2. **Redirect URI Match**: The `UAE_PASS_REDIRECT_URI` must match EXACTLY what's registered in UAE PASS portal:
   - Same protocol (http vs https)
   - Same domain
   - Same port
   - Same path
   - No trailing slash differences

3. **No Extra Spaces**: Make sure there are no leading/trailing spaces in your environment variables.

4. **Restart Server**: After changing `.env.local`, restart the dev server (`npm run dev`).

## Getting Your Credentials

1. Register your application at the [UAE PASS Developer Portal](https://docs.uaepass.ae/)
2. Configure your redirect URI (must match `UAE_PASS_REDIRECT_URI` exactly)
3. Copy your Client ID and Client Secret

## Generating Session Secret

Generate a secure random session secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```




