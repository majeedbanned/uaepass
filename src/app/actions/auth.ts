/**
 * Authentication Server Actions
 */

'use server';

import { deleteSession } from '@/lib/session';
import { buildLogoutUrl } from '@/lib/uaePass';
import { redirect } from 'next/navigation';

/**
 * Logout from both the application and UAE PASS
 * 
 * This performs a complete logout:
 * 1. Clears the local application session (cookies)
 * 2. Redirects to UAE PASS logout endpoint to clear UAE PASS session
 * 3. UAE PASS then redirects back to the application
 * 
 * Reference: UAE PASS RP-Initiated Logout
 */
export async function logout() {
  // Clear local session first
  await deleteSession();
  
  // Build UAE PASS logout URL with redirect back to home
  const logoutUrl = buildLogoutUrl(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  
  // Redirect to UAE PASS logout endpoint
  // This will clear the UAE PASS session and redirect back to our app
  redirect(logoutUrl);
}

/**
 * Local logout only (does not clear UAE PASS session)
 * Use this if you only want to clear the local session without logging out of UAE PASS
 */
export async function localLogout() {
  await deleteSession();
  redirect('/');
}
