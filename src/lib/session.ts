/**
 * Session Management Utilities
 * 
 * Handles secure storage and retrieval of session data using HTTP-only cookies
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { NormalizedUserProfile } from './uaePass';

const SESSION_COOKIE_NAME = 'uaepass_session';
const STATE_COOKIE_NAME = 'uaepass_state';
const NONCE_COOKIE_NAME = 'uaepass_nonce';
const PKCE_COOKIE_NAME = 'uaepass_pkce';

// Session data structure
export interface SessionData {
  user: NormalizedUserProfile;
  accessToken: string;
  idToken: string;
  expiresAt: number;
}

/**
 * Get session secret from environment or generate a default (for development only)
 */
function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

/**
 * Create or update a session
 */
export async function createSession(userData: NormalizedUserProfile, tokens: {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + tokens.expiresIn * 1000;

  const sessionData: SessionData = {
    user: userData,
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
    expiresAt,
  };

  // Encrypt session data
  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(getSessionSecret());

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expiresIn,
  });
}

/**
 * Get current session
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload as SessionData;
  } catch (error) {
    // Session expired or invalid
    return null;
  }
}

/**
 * Delete session (logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Store state for CSRF protection
 */
export async function setState(state: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });
}

/**
 * Get and validate state
 */
export async function getState(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(STATE_COOKIE_NAME)?.value || null;
}

/**
 * Delete state after validation
 */
export async function deleteState(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STATE_COOKIE_NAME);
}

/**
 * Store nonce for ID token validation
 */
export async function setNonce(nonce: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(NONCE_COOKIE_NAME, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });
}

/**
 * Get nonce
 */
export async function getNonce(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(NONCE_COOKIE_NAME)?.value || null;
}

/**
 * Delete nonce after validation
 */
export async function deleteNonce(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NONCE_COOKIE_NAME);
}

/**
 * Store PKCE code verifier
 */
export async function setCodeVerifier(codeVerifier: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PKCE_COOKIE_NAME, codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });
}

/**
 * Get PKCE code verifier
 */
export async function getCodeVerifier(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PKCE_COOKIE_NAME)?.value || null;
}

/**
 * Delete PKCE code verifier after token exchange
 */
export async function deleteCodeVerifier(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PKCE_COOKIE_NAME);
}






