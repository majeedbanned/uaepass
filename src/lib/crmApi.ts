/**
 * FXBackoffice CRM API Integration
 * 
 * Handles user lookup, registration, and direct login with the CRM system
 */

import { NormalizedUserProfile } from './uaePass';

// CRM API Configuration
export interface CRMConfig {
  baseUrl: string;
  apiToken: string;
  apiVersion: string;
}

// CRM User from API response
export interface CRMUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  enabled: boolean;
  verified: boolean;
  [key: string]: any; // Allow additional fields
}

// Direct Login Response
export interface DirectLoginResponse {
  url: string;
}

// Registration Request
export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  lead: boolean;
  password: string;
  sendWelcomeEmail: boolean;
  country: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

// Registration Response
export interface RegistrationResponse {
  id: number;
  email: string;
  [key: string]: any;
}

/**
 * Get CRM configuration from environment variables
 */
export function getCRMConfig(): CRMConfig {
  const baseUrl = process.env.CRM_BASE_URL || 'https://my.cmsfinancial.ae';
  const apiToken = process.env.CRM_API_TOKEN || '';
  const apiVersion = process.env.CRM_API_VERSION || '1.0.0';

  if (!apiToken) {
    throw new Error('CRM_API_TOKEN environment variable is not set');
  }

  return {
    baseUrl,
    apiToken,
    apiVersion,
  };
}

/**
 * Generate a random password for new user registration
 */
function generateRandomPassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const crypto = require('crypto');
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

/**
 * Find user by email in CRM
 * Returns the user if found, null if not found
 */
export async function findUserByEmail(email: string): Promise<CRMUser | null> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/users?version=${config.apiVersion}`;

  console.log('[CRM] Finding user by email:', email);
  console.log('[CRM] Request URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log('[CRM] Find user response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRM] Find user error response:', errorText);
      throw new Error(`CRM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[CRM] Find user response:', JSON.stringify(data, null, 2));

    // API returns an array - check if user exists
    if (Array.isArray(data) && data.length > 0) {
      console.log('[CRM] User found with ID:', data[0].id);
      return data[0] as CRMUser;
    }

    console.log('[CRM] User not found in CRM');
    return null;
  } catch (error) {
    console.error('[CRM] Error finding user:', error);
    throw error;
  }
}

/**
 * Register a new user in CRM
 */
export async function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
}): Promise<CRMUser> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/users/new?version=${config.apiVersion}`;

  // Ensure phone number has + prefix
  const phoneNumber = userData.phone.startsWith('+') 
    ? userData.phone 
    : `+${userData.phone}`;

  const registrationData: RegistrationRequest = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: phoneNumber,
    email: userData.email,
    lead: false,
    password: generateRandomPassword(),
    sendWelcomeEmail: true,
    country: userData.country || 'CY', // Default to Cyprus as specified
    emailVerified: true,
    phoneVerified: true,
  };

  console.log('[CRM] Registering new user:', {
    ...registrationData,
    password: '***HIDDEN***', // Don't log password
  });
  console.log('[CRM] Request URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    console.log('[CRM] Register user response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('[CRM] Register user response body:', responseText);

    if (!response.ok) {
      throw new Error(`CRM registration failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('[CRM] User registered successfully with ID:', data.id);

    return data as CRMUser;
  } catch (error) {
    console.error('[CRM] Error registering user:', error);
    throw error;
  }
}

/**
 * Get direct login URL for a user
 */
export async function getDirectLoginUrl(
  userId: number,
  options?: {
    locale?: string;
    redirectUrl?: string;
    logoutUrl?: string;
  }
): Promise<string> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/user/direct_login?version=${config.apiVersion}`;

  const requestBody = {
    user: userId,
    locale: options?.locale || 'en',
    redirectUrl: options?.redirectUrl || `${config.baseUrl}/`,
    logoutUrl: options?.logoutUrl || `${config.baseUrl}/logout`,
    isClientApi: false,
  };

  console.log('[CRM] Getting direct login URL for user ID:', userId);
  console.log('[CRM] Request URL:', url);
  console.log('[CRM] Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[CRM] Direct login response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRM] Direct login error response:', errorText);
      throw new Error(`CRM direct login failed: ${response.status} ${response.statusText}`);
    }

    const data: DirectLoginResponse = await response.json();
    console.log('[CRM] Direct login URL received:', data.url);

    return data.url;
  } catch (error) {
    console.error('[CRM] Error getting direct login URL:', error);
    throw error;
  }
}

/**
 * Main function: Handle CRM login/registration flow after UAE Pass authentication
 * 
 * Flow:
 * 1. Check if user exists in CRM by email
 * 2. If exists: Get direct login URL
 * 3. If not exists: Register user, then get direct login URL
 * 4. Return the direct login URL for redirect
 */
export async function handleCRMAuth(uaePassUser: NormalizedUserProfile): Promise<{
  success: boolean;
  loginUrl?: string;
  isNewUser: boolean;
  crmUserId?: number;
  error?: string;
}> {
  console.log('========================================');
  console.log('[CRM] Starting CRM authentication flow');
  console.log('[CRM] UAE Pass user data:', JSON.stringify(uaePassUser, null, 2));
  console.log('========================================');

  try {
    // Step 1: Check if user exists in CRM
    console.log('[CRM] Step 1: Checking if user exists in CRM...');
    let crmUser = await findUserByEmail(uaePassUser.email);
    let isNewUser = false;

    // Step 2: If user doesn't exist, register them
    if (!crmUser) {
      console.log('[CRM] Step 2: User not found, registering new user...');
      isNewUser = true;

      crmUser = await registerUser({
        firstName: uaePassUser.firstName !== 'N/A' ? uaePassUser.firstName : 'User',
        lastName: uaePassUser.lastName !== 'N/A' ? uaePassUser.lastName : 'Account',
        email: uaePassUser.email,
        phone: uaePassUser.mobile !== 'N/A' ? uaePassUser.mobile : '+971500000000',
        country: 'CY', // Default country as specified
      });

      console.log('[CRM] New user registered with ID:', crmUser.id);
    } else {
      console.log('[CRM] Step 2: Existing user found with ID:', crmUser.id);
    }

    // Step 3: Get direct login URL
    console.log('[CRM] Step 3: Getting direct login URL...');
    const loginUrl = await getDirectLoginUrl(crmUser.id);

    console.log('========================================');
    console.log('[CRM] CRM authentication flow completed successfully');
    console.log('[CRM] Is new user:', isNewUser);
    console.log('[CRM] CRM User ID:', crmUser.id);
    console.log('[CRM] Login URL:', loginUrl);
    console.log('========================================');

    return {
      success: true,
      loginUrl,
      isNewUser,
      crmUserId: crmUser.id,
    };
  } catch (error) {
    console.error('========================================');
    console.error('[CRM] CRM authentication flow failed');
    console.error('[CRM] Error:', error);
    console.error('========================================');

    return {
      success: false,
      isNewUser: false,
      error: error instanceof Error ? error.message : 'Unknown CRM error',
    };
  }
}

