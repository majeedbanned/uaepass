/**
 * UAE PASS Login Route Handler
 * 
 * Handles automatic redirect to UAE PASS authentication gateway
 * Route Handlers can modify cookies, unlike Server Components
 */

import { NextResponse } from 'next/server';
import {
  generatePKCEPair,
  generateState,
  generateNonce,
  buildAuthorizationUrl,
} from '@/lib/uaePass';
import { setState, setNonce, setCodeVerifier } from '@/lib/session';

export async function GET() {
  try {
    // Generate PKCE pair
    const pkcePair = generatePKCEPair();

    // Generate state for CSRF protection
    const state = generateState();

    // Generate nonce for ID token validation
    const nonce = generateNonce();

    // Store state, nonce, and code verifier in secure cookies
    await setState(state);
    await setNonce(nonce);
    await setCodeVerifier(pkcePair.codeVerifier);

    // Build authorization URL
    const authUrl = buildAuthorizationUrl({
      state,
      nonce,
      codeChallenge: pkcePair.codeChallenge,
      codeChallengeMethod: pkcePair.codeChallengeMethod,
    });

    // Redirect to UAE PASS
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate login' },
      { status: 500 }
    );
  }
}

