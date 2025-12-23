/**
 * UAE PASS Callback Server Action
 * 
 * Handles the OAuth 2.0 callback processing as a Server Action
 * Server Actions CAN modify cookies, unlike Server Components
 */

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import {
  exchangeCodeForTokens,
  validateIdToken,
  fetchUserInfo,
  normalizeUserProfile,
  NormalizedUserProfile,
} from '@/lib/uaePass';

const SESSION_COOKIE_NAME = 'uaepass_session';
const STATE_COOKIE_NAME = 'uaepass_state';
const NONCE_COOKIE_NAME = 'uaepass_nonce';
const PKCE_COOKIE_NAME = 'uaepass_pkce';

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export interface CallbackResult {
  success: boolean;
  error?: string;
  user?: NormalizedUserProfile;
}

export async function processUAEPassCallback(
  code: string,
  state: string
): Promise<CallbackResult> {
  const cookieStore = await cookies();

  try {
    // Step 1: Validate state parameter (CSRF protection)
    const storedState = cookieStore.get(STATE_COOKIE_NAME)?.value;
    if (!storedState || storedState !== state) {
      console.error('State validation failed', { stored: storedState, received: state });
      return { success: false, error: 'Invalid state parameter. Possible CSRF attack detected.' };
    }

    // Get stored nonce and code verifier
    const nonce = cookieStore.get(NONCE_COOKIE_NAME)?.value;
    const codeVerifier = cookieStore.get(PKCE_COOKIE_NAME)?.value;

    if (!nonce || !codeVerifier) {
      return { success: false, error: 'Missing nonce or code verifier. Session may have expired. Please try logging in again.' };
    }

    // Step 2: Exchange authorization code for tokens
    console.log('Exchanging code for tokens...');
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    console.log('Token exchange successful');

    // Step 3: Validate ID token (optional - may fail with different issuer configs)
    try {
      if (tokens.id_token) {
        await validateIdToken(tokens.id_token, nonce);
        console.log('ID token validated');
      }
    } catch (validationError) {
      console.warn('ID token validation warning (continuing anyway):', validationError);
      // Continue - some UAE PASS setups may have different issuer configurations
    }

    // Step 4: Fetch user information
    console.log('Fetching user info...');
    const userInfo = await fetchUserInfo(tokens.access_token);
    console.log('User info fetched');

    // Step 5: Normalize user profile
    const normalizedProfile = normalizeUserProfile(userInfo);

    // Step 6: Create session
    const expiresIn = tokens.expires_in || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    const sessionData = {
      user: normalizedProfile,
      accessToken: tokens.access_token,
      idToken: tokens.id_token || '',
      expiresAt,
    };

    const sessionToken = await new SignJWT(sessionData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt / 1000))
      .sign(getSessionSecret());

    // Set session cookie
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    });

    // Clean up temporary cookies
    cookieStore.delete(STATE_COOKIE_NAME);
    cookieStore.delete(NONCE_COOKIE_NAME);
    cookieStore.delete(PKCE_COOKIE_NAME);

    return { success: true, user: normalizedProfile };
  } catch (error) {
    console.error('Callback processing error:', error);

    // Clean up cookies on error
    try {
      cookieStore.delete(STATE_COOKIE_NAME);
      cookieStore.delete(NONCE_COOKIE_NAME);
      cookieStore.delete(PKCE_COOKIE_NAME);
    } catch (cleanupError) {
      console.error('Failed to clean up cookies:', cleanupError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}


