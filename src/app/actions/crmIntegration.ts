/**
 * CRM Integration Server Action
 * 
 * Handles CRM authentication after user confirms their UAE PASS info.
 * This is called separately after user clicks the confirmation button.
 */

'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
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
  errorType?: 'SOP_LEVEL' | 'CRM_ERROR' | 'REGISTRATION_ERROR' | 'SESSION_ERROR' | 'UNKNOWN';
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
      return { 
        success: false, 
        error: 'No active session. Please log in again.',
        errorType: 'SESSION_ERROR',
      };
    }

    // Decode session to get user info
    let sessionData: any;
    try {
      const { payload } = await jwtVerify(sessionToken, getSessionSecret());
      sessionData = payload;
    } catch (error) {
      return { 
        success: false, 
        error: 'Invalid session. Please log in again.',
        errorType: 'SESSION_ERROR',
      };
    }

    const user: NormalizedUserProfile = sessionData.user;
    if (!user) {
      return { 
        success: false, 
        error: 'User information not found in session.',
        errorType: 'SESSION_ERROR',
      };
    }

    console.log('========================================');
    console.log('[CRM INTEGRATION] Starting CRM integration...');
    console.log('[CRM INTEGRATION] User:', user.email);
    console.log('[CRM INTEGRATION] Emirates ID:', user.emiratesId);
    console.log('[CRM INTEGRATION] UUID:', user.uuid);
    console.log('========================================');

    // Process CRM authentication (includes SOP validation)
    const crmResult = await handleCRMAuth(user);

    if (crmResult.success && crmResult.loginUrl) {
      console.log('[CRM INTEGRATION] CRM integration successful');
      console.log('[CRM INTEGRATION] Is new CRM user:', crmResult.isNewUser);

      return {
        success: true,
        crmLoginUrl: crmResult.loginUrl,
        isNewCRMUser: crmResult.isNewUser,
      };
    } else {
      console.error('[CRM INTEGRATION] CRM integration failed:', crmResult.error);
      console.error('[CRM INTEGRATION] Error type:', crmResult.errorType);
      
      return {
        success: false,
        error: crmResult.error || 'CRM integration failed',
        errorType: crmResult.errorType || 'UNKNOWN',
      };
    }
  } catch (error) {
    console.error('[CRM INTEGRATION] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CRM integration failed',
      errorType: 'UNKNOWN',
    };
  }
}
