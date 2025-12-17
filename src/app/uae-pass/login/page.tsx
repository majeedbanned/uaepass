/**
 * UAE PASS Login Page
 * 
 * Initiates the UAE PASS authentication flow by redirecting to the authorization endpoint
 */

import { redirect } from 'next/navigation';
import {
  generatePKCEPair,
  generateState,
  generateNonce,
  buildAuthorizationUrl,
} from '@/lib/uaePass';
import { setState, setNonce, setCodeVerifier } from '@/lib/session';

/**
 * Server Action: Initiate UAE PASS Login
 * 
 * Note: redirect() throws a special NEXT_REDIRECT error internally.
 * We must NOT wrap it in try-catch, or call it after try-catch completes.
 */
async function initiateLogin() {
  'use server';

  // Validate configuration first (this can throw if env vars not set)
  // getUAEPassConfig() is called in buildAuthorizationUrl() and will throw
  // a clear error if CLIENT_ID or CLIENT_SECRET are missing

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

  // Redirect to UAE PASS - this MUST be outside try-catch
  // redirect() throws NEXT_REDIRECT internally which is expected behavior
  redirect(authUrl);
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign in with UAE PASS
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Use your UAE PASS credentials to securely access this application
          </p>
        </div>

        <div className="mt-8">
          <form action={initiateLogin}>
            <button
              type="submit"
              className="group relative w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Sign in with UAE PASS</span>
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}




