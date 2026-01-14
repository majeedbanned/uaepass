/**
 * FXBackoffice CRM API Integration
 * 
 * Handles user lookup, registration, update, and direct login with the CRM system
 * Updated to support Emirates ID verification and custom fields
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
  customFields?: Record<string, any>;
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

// Emirates ID Custom Fields for CRM
export interface EmiratesIdCustomFields {
  custom_client_emirate_id?: string;
  custom_client_emirateid_nationality?: string;
  custom_client_emirateid_email?: string;
  custom_client_emirateid_mobile?: string;
  custom_client_emirateid_fullname?: string;
  custom_client_emirateid_uuid?: string;
}

// User Update Request
export interface UserUpdateRequest {
  user: number;
  customFields: EmiratesIdCustomFields;
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
 */
export async function findUserByEmail(email: string): Promise<CRMUser | null> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/users?version=${config.apiVersion}`;

  console.log('[CRM] Finding user by email:', email);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRM] Find user by email error:', errorText);
      return null; // Return null instead of throwing for search failures
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      console.log('[CRM] User found by email with ID:', data[0].id);
      return data[0] as CRMUser;
    }

    return null;
  } catch (error) {
    console.error('[CRM] Error finding user by email:', error);
    return null;
  }
}

/**
 * Find user by custom field (Emirates ID email)
 */
export async function findUserByEmiratesIdEmail(email: string): Promise<CRMUser | null> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/users?version=${config.apiVersion}`;

  console.log('[CRM] Finding user by Emirates ID email:', email);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customFields: {
          custom_client_emirateid_email: email,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRM] Find user by Emirates ID email error:', errorText);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      console.log('[CRM] User found by Emirates ID email with ID:', data[0].id);
      return data[0] as CRMUser;
    }

    return null;
  } catch (error) {
    console.error('[CRM] Error finding user by Emirates ID email:', error);
    return null;
  }
}

/**
 * Find user by custom field (Emirates ID UUID)
 */
export async function findUserByEmiratesIdUuid(uuid: string): Promise<CRMUser | null> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/users?version=${config.apiVersion}`;

  console.log('[CRM] Finding user by Emirates ID UUID:', uuid);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customFields: {
          custom_client_emirateid_uuid: uuid,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRM] Find user by Emirates ID UUID error:', errorText);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      console.log('[CRM] User found by Emirates ID UUID with ID:', data[0].id);
      return data[0] as CRMUser;
    }

    return null;
  } catch (error) {
    console.error('[CRM] Error finding user by Emirates ID UUID:', error);
    return null;
  }
}

/**
 * Find user by custom field (Emirates ID number)
 */
export async function findUserByEmiratesId(emiratesId: string): Promise<CRMUser | null> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/users?version=${config.apiVersion}`;

  console.log('[CRM] Finding user by Emirates ID:', emiratesId);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customFields: {
          custom_client_emirate_id: emiratesId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRM] Find user by Emirates ID error:', errorText);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      console.log('[CRM] User found by Emirates ID with ID:', data[0].id);
      return data[0] as CRMUser;
    }

    return null;
  } catch (error) {
    console.error('[CRM] Error finding user by Emirates ID:', error);
    return null;
  }
}

/**
 * Find existing user by any identifier (email, UUID, Emirates ID, or custom fields)
 * Returns the first match found
 */
export async function findExistingUser(uaePassUser: NormalizedUserProfile): Promise<CRMUser | null> {
  console.log('[CRM] Searching for existing user by multiple identifiers...');

  // Search by Emirates ID email custom field
  if (uaePassUser.email && uaePassUser.email !== 'N/A') {
    const userByEmiratesEmail = await findUserByEmiratesIdEmail(uaePassUser.email);
    if (userByEmiratesEmail) {
      console.log('[CRM] Found user by Emirates ID email');
      return userByEmiratesEmail;
    }
  }

  // Search by Emirates ID UUID custom field
  if (uaePassUser.uuid) {
    const userByUuid = await findUserByEmiratesIdUuid(uaePassUser.uuid);
    if (userByUuid) {
      console.log('[CRM] Found user by Emirates ID UUID');
      return userByUuid;
    }
  }

  // Search by regular email
  if (uaePassUser.email && uaePassUser.email !== 'N/A') {
    const userByEmail = await findUserByEmail(uaePassUser.email);
    if (userByEmail) {
      console.log('[CRM] Found user by email');
      return userByEmail;
    }
  }

  // Search by Emirates ID number custom field
  if (uaePassUser.emiratesId && uaePassUser.emiratesId !== 'N/A') {
    const userByEmiratesId = await findUserByEmiratesId(uaePassUser.emiratesId);
    if (userByEmiratesId) {
      console.log('[CRM] Found user by Emirates ID');
      return userByEmiratesId;
    }
  }

  console.log('[CRM] No existing user found');
  return null;
}

/**
 * Update user's Emirates ID details in CRM
 */
export async function updateUserEmiratesIdDetails(
  userId: number,
  uaePassUser: NormalizedUserProfile
): Promise<boolean> {
  const config = getCRMConfig();
  const url = `${config.baseUrl}/rest/users/update?version=${config.apiVersion}`;

  const customFields: EmiratesIdCustomFields = {
    custom_client_emirateid_uuid: uaePassUser.uuid || '',
    custom_client_emirateid_email: uaePassUser.email !== 'N/A' ? uaePassUser.email : '',
    custom_client_emirateid_fullname: uaePassUser.fullName !== 'N/A' ? uaePassUser.fullName : '',
    custom_client_emirateid_mobile: uaePassUser.mobile !== 'N/A' ? uaePassUser.mobile : '',
  };

  // Only add Emirates ID if available (SOP2/SOP3)
  if (uaePassUser.emiratesId && uaePassUser.emiratesId !== 'N/A') {
    customFields.custom_client_emirate_id = uaePassUser.emiratesId;
  }

  // Only add nationality if available
  if (uaePassUser.nationality) {
    customFields.custom_client_emirateid_nationality = uaePassUser.nationality;
  }

  const updateRequest: UserUpdateRequest = {
    user: userId,
    customFields,
  };

  console.log('[CRM] Updating user Emirates ID details:', JSON.stringify(updateRequest, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRequest),
    });

    console.log('[CRM] Update user response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRM] Update user error response:', errorText);
      throw new Error(`CRM update failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[CRM] User Emirates ID details updated successfully');
    return true;
  } catch (error) {
    console.error('[CRM] Error updating user Emirates ID details:', error);
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
    logoutUrl: options?.logoutUrl || `${config.baseUrl}/login`,
    isClientApi: false,
  };

  console.log('[CRM] Getting direct login URL for user ID:', userId);

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
    console.log('[CRM] Direct login URL received');

    return data.url;
  } catch (error) {
    console.error('[CRM] Error getting direct login URL:', error);
    throw error;
  }
}

/**
 * Validate SOP level - Emirates ID is required (SOP2 or SOP3)
 * Returns error message if validation fails, null if valid
 */
export function validateSOPLevel(uaePassUser: NormalizedUserProfile): string | null {
  // Check if Emirates ID is present (indicates SOP2 or SOP3)
  if (!uaePassUser.emiratesId || uaePassUser.emiratesId === 'N/A' || uaePassUser.emiratesId === '') {
    return 'Emirates ID verification required. Your UAE PASS account must be verified (SOP2 or SOP3) to continue. Please upgrade your UAE PASS account and try again.';
  }

  // Validate Emirates ID format (should be 15 digits, may have dashes)
  const emiratesIdClean = uaePassUser.emiratesId.replace(/-/g, '');
  if (!/^\d{15}$/.test(emiratesIdClean)) {
    return 'Invalid Emirates ID format. Please ensure your UAE PASS account has a valid Emirates ID.';
  }

  return null; // Valid
}

/**
 * Main function: Handle CRM login/registration flow after UAE Pass authentication
 * 
 * Flow:
 * 1. Validate SOP level (require SOP2/SOP3 with Emirates ID)
 * 2. Check if user exists in CRM by multiple identifiers
 * 3. If exists: Update Emirates ID details, then get direct login URL
 * 4. If not exists: Register user, update Emirates ID details, then get direct login URL
 * 5. Return the direct login URL for redirect
 */
export async function handleCRMAuth(uaePassUser: NormalizedUserProfile): Promise<{
  success: boolean;
  loginUrl?: string;
  isNewUser: boolean;
  crmUserId?: number;
  error?: string;
  errorType?: 'SOP_LEVEL' | 'CRM_ERROR' | 'UNKNOWN';
}> {
  console.log('========================================');
  console.log('[CRM] Starting CRM authentication flow');
  console.log('[CRM] UAE Pass user data:', JSON.stringify(uaePassUser, null, 2));
  console.log('========================================');

  try {
    // Step 1: Validate SOP level (require Emirates ID)
    console.log('[CRM] Step 1: Validating SOP level...');
    const sopError = validateSOPLevel(uaePassUser);
    if (sopError) {
      console.log('[CRM] SOP validation failed:', sopError);
      return {
        success: false,
        isNewUser: false,
        error: sopError,
        errorType: 'SOP_LEVEL',
      };
    }
    console.log('[CRM] SOP validation passed (SOP2/SOP3 confirmed)');

    // Step 2: Check if user exists in CRM by multiple identifiers
    console.log('[CRM] Step 2: Checking if user exists in CRM...');
    let crmUser = await findExistingUser(uaePassUser);
    let isNewUser = false;

    // Step 3: If user doesn't exist, register them
    if (!crmUser) {
      console.log('[CRM] Step 3: User not found, registering new user...');
      isNewUser = true;

      crmUser = await registerUser({
        firstName: uaePassUser.firstName !== 'N/A' ? uaePassUser.firstName : 'User',
        lastName: uaePassUser.lastName !== 'N/A' ? uaePassUser.lastName : 'Account',
        email: uaePassUser.email !== 'N/A' ? uaePassUser.email : `user_${Date.now()}@uaepass.ae`,
        phone: uaePassUser.mobile !== 'N/A' ? uaePassUser.mobile : '+971500000000',
        country: 'CY', // Default country as specified
      });

      console.log('[CRM] New user registered with ID:', crmUser.id);
    } else {
      console.log('[CRM] Step 3: Existing user found with ID:', crmUser.id);
    }

    // Step 4: Update Emirates ID details in CRM (for both new and existing users)
    console.log('[CRM] Step 4: Updating Emirates ID details...');
    await updateUserEmiratesIdDetails(crmUser.id, uaePassUser);

    // Step 5: Get direct login URL
    console.log('[CRM] Step 5: Getting direct login URL...');
    const loginUrl = await getDirectLoginUrl(crmUser.id);

    console.log('========================================');
    console.log('[CRM] CRM authentication flow completed successfully');
    console.log('[CRM] Is new user:', isNewUser);
    console.log('[CRM] CRM User ID:', crmUser.id);
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
      errorType: 'CRM_ERROR',
    };
  }
}
