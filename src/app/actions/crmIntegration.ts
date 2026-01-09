/**
 * CRM Integration Server Action
 * 
 * Handles CRM authentication after user confirms their UAE PASS info.
 * This is called separately after user clicks the confirmation button.
 */

'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { NormalizedUserProfile } from '@/lib/uaePass';
import { handleCRMAuth } from '@/lib/crmApi';

const SESSION_COOKIE_NAME = 'uaepass_session';

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export interface CRMIntegrationResult {
  success: boolean;
  error?: string;
  crmLoginUrl?: string;
  isNewCRMUser?: boolean;
}

/**
 * Process CRM integration after user confirms their info
 */
export async function processCRMIntegration(): Promise<CRMIntegrationResult> {
  const cookieStore = await cookies();

  try {
    // Get user from session
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) {
      return { success: false, error: 'No active session. Please log in again.' };
    }

    // Decode session to get user info
    let sessionData: any;
    try {
      const { payload } = await jwtVerify(sessionToken, getSessionSecret());
      sessionData = payload;
    } catch (error) {
      return { success: false, error: 'Invalid session. Please log in again.' };
    }

    const user: NormalizedUserProfile = sessionData.user;
    if (!user) {
      return { success: false, error: 'User information not found in session.' };
    }

    console.log('========================================');
    console.log('[CRM INTEGRATION] Starting CRM integration...');
    console.log('[CRM INTEGRATION] User:', user.email);
    console.log('========================================');

    // Process CRM authentication
    const crmResult = await handleCRMAuth(user);

    if (crmResult.success && crmResult.loginUrl) {
      console.log('[CRM INTEGRATION] CRM integration successful');
      console.log('[CRM INTEGRATION] Is new CRM user:', crmResult.isNewUser);
      console.log('[CRM INTEGRATION] CRM Login URL:', crmResult.loginUrl);

      return {
        success: true,
        crmLoginUrl: crmResult.loginUrl,
        isNewCRMUser: crmResult.isNewUser,
      };
    } else {
      console.error('[CRM INTEGRATION] CRM integration failed:', crmResult.error);
      return {
        success: false,
        error: crmResult.error || 'CRM integration failed',
      };
    }
  } catch (error) {
    console.error('[CRM INTEGRATION] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CRM integration failed',
    };
  }
}

