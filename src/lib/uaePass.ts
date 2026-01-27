/**
 * UAE PASS Authentication Helper Module
 * 
 * Implements OAuth 2.0 Authorization Code Flow with PKCE as per UAE PASS documentation
 * Reference: https://docs.uaepass.ae/
 */

import crypto from 'crypto';
import dns from 'dns';
import https from 'https';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';
import { uaePassLogger as logger } from './logger';

// UAE PASS Configuration Interface
export interface UAEPassConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  logoutEndpoint: string;
  jwksUri: string;
  issuer: string;
  scope: string;
}

// Token Response from UAE PASS
export interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

// User Profile from UAE PASS UserInfo endpoint
export interface UAEPassUserProfile {
  sub: string; // Subject identifier
  uuid?: string; // User unique ID (UUID format) - UAE PASS specific field
  fullName?: string;
  firstName?: string;
  lastName?: string;
  emiratesId?: string;
  mobile?: string;
  email?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  acr?: string; // Authentication Context Class Reference (SOP level)
  userType?: string; // User type returned from UAE PASS
  [key: string]: any; // Allow additional fields
}

// Valid SOP levels from UAE PASS
export type SOPLevel = 'SOP1' | 'SOP2' | 'SOP3' | 'UNKNOWN';

// ACR (Authentication Context Class Reference) values for SOP levels
export const ACR_VALUES = {
  SOP1: 'urn:safelayer:tws:policies:authentication:level:low',
  SOP2: 'urn:safelayer:tws:policies:authentication:level:substantial',
  SOP3: 'urn:safelayer:tws:policies:authentication:level:high',
} as const;

// Normalized User Profile for our application
export interface NormalizedUserProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  emiratesId: string;
  mobile: string;
  email: string;
  dateOfBirth?: string;
  nationality?: string;
  sub: string; // OIDC subject identifier
  uuid?: string; // UAE PASS user unique ID (UUID format)
  acr?: string; // ACR value from ID token
  userType?: SOPLevel; // Determined SOP level
}

// PKCE Code Challenge and Verifier
export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}

/**
 * Get UAE PASS configuration from environment variables
 * 
 * UAE PASS Staging/Sandbox Base URL: https://stg-id.uaepass.ae
 * UAE PASS Production Base URL: https://id.uaepass.ae
 * 
 * Reference: https://docs.uaepass.ae/
 */
export function getUAEPassConfig(): UAEPassConfig {
  const clientId = process.env.UAE_PASS_CLIENT_ID || '';
  const clientSecret = process.env.UAE_PASS_CLIENT_SECRET || '';

  // Validate required configuration early
  if (!clientId) {
    throw new Error('UAE_PASS_CLIENT_ID environment variable is not set');
  }
  if (!clientSecret) {
    throw new Error('UAE_PASS_CLIENT_SECRET environment variable is not set');
  }

  const config: UAEPassConfig = {
    clientId,
    clientSecret,
    redirectUri: process.env.UAE_PASS_REDIRECT_URI || 'http://localhost:3000/uae-pass/callback',
    // UAE PASS Staging endpoints (default)
    authorizationEndpoint: process.env.UAE_PASS_AUTHORIZATION_ENDPOINT || 'https://id.uaepass.ae/idshub/authorize',
    tokenEndpoint: process.env.UAE_PASS_TOKEN_ENDPOINT || 'https://id.uaepass.ae/idshub/token',
    userInfoEndpoint: process.env.UAE_PASS_USERINFO_ENDPOINT || 'https://id.uaepass.ae/idshub/userinfo',
    logoutEndpoint: process.env.UAE_PASS_LOGOUT_ENDPOINT || 'https://id.uaepass.ae/idshub/logout',
    jwksUri: process.env.UAE_PASS_JWKS_URI || 'https://id.uaepass.ae/idshub/.well-known/jwks',
    issuer: process.env.UAE_PASS_ISSUER || 'https://id.uaepass.ae',
    // UAE PASS required scope
    scope: process.env.UAE_PASS_SCOPE || 'urn:uae:digitalid:profile:general',
  };

  return config;
}

/**
 * Generate PKCE code verifier and challenge
 * Reference: RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients
 */
export function generatePKCEPair(): PKCEPair {
  // Generate a cryptographically random code verifier
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64url')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Create code challenge using SHA256 hash
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate a random nonce for ID token validation
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64url');
}

/**
 * Build the UAE PASS authorization URL
 * Reference: UAE PASS OAuth 2.0 Authorization Endpoint
 */
export function buildAuthorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}): string {
  const config = getUAEPassConfig();

  const urlParams = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: params.state,
    nonce: params.nonce,
    code_challenge: params.codeChallenge,
    code_challenge_method: params.codeChallengeMethod,
    acr_values: 'urn:safelayer:tws:policies:authentication:level:low', // Authentication context class
  });

  return `${config.authorizationEndpoint}?${urlParams.toString()}`;
}

/**
 * Build UAE PASS logout URL
 * This URL will clear the UAE PASS session and redirect back to the specified URL
 * Reference: UAE PASS Logout - OIDC RP-Initiated Logout
 * 
 * @param redirectUri - The URL to redirect to after logout (defaults to app base URL)
 */
export function buildLogoutUrl(redirectUri?: string): string {
  const config = getUAEPassConfig();
  
  // Use provided redirect URI or default to the base app URL
  const postLogoutRedirect = redirectUri || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const urlParams = new URLSearchParams({
    redirect_uri: postLogoutRedirect,
  });

  return `${config.logoutEndpoint}?${urlParams.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * Reference: UAE PASS Token Endpoint - OAuth 2.0 Token Request
 * 
 * UAE PASS token endpoint expects:
 * - POST request with application/x-www-form-urlencoded body
 * - Client credentials in the body (client_id, client_secret)
 * - Grant type, code, and redirect_uri
 */
/**
 * Fetch with retry logic and DNS error handling
 * Uses native https module as fallback if fetch fails with DNS errors
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  
  // Resolve DNS first to have IP ready for fallback
  let resolvedIP: string | null = null;
  try {
    const dnsPromises = dns.promises;
    const addresses = await dnsPromises.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      resolvedIP = addresses[0];
      logger.debug('DNS resolved:', { hostname, ip: resolvedIP });
    }
  } catch (dnsError) {
    logger.debug('DNS pre-resolution failed (will retry on fetch):', dnsError);
  }

  // Simple retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 200 * attempt; // 200ms, 400ms delays
        logger.debug(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Try fetch
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const isDNSError = lastError.message.includes('EAI_AGAIN') || 
                         lastError.message.includes('getaddrinfo') ||
                         lastError.message.includes('ENOTFOUND') ||
                         lastError.message.includes('fetch failed');
      
      // If DNS error and we have resolved IP, use https module fallback on last attempt
      if (isDNSError && resolvedIP && attempt === maxRetries - 1) {
        logger.warn('Using HTTPS module fallback due to DNS issues');
        return await fetchWithHttpsModule(urlObj, resolvedIP, options);
      }
      
      // If not last attempt, continue retrying
      if (attempt < maxRetries - 1) {
        continue;
      }
    }
  }

  // Final fallback if we have IP
  if (resolvedIP && lastError) {
    const isDNSError = lastError.message.includes('EAI_AGAIN') || 
                       lastError.message.includes('getaddrinfo') ||
                       lastError.message.includes('ENOTFOUND') ||
                       lastError.message.includes('fetch failed');
    if (isDNSError) {
      logger.warn('Using HTTPS module fallback on final attempt');
      return await fetchWithHttpsModule(urlObj, resolvedIP, options);
    }
  }

  throw lastError || new Error('Fetch failed after all retries');
}

/**
 * Fallback to native https module when fetch fails
 */
async function fetchWithHttpsModule(
  urlObj: URL,
  ipAddress: string,
  options: RequestInit
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const body = options.body as string | undefined;
    
    const requestOptions = {
      hostname: ipAddress,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        ...(options.headers as Record<string, string>),
        'Host': urlObj.hostname, // Important for SNI
      },
      timeout: 30000,
    };

    const req = https.request(requestOptions, (res: any) => {
      let data = '';
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });
      
      res.on('end', () => {
        try {
          // Create Response object (available in Node.js 18+)
          const response = new Response(data, {
            status: res.statusCode || 200,
            statusText: res.statusMessage || 'OK',
            headers: res.headers as HeadersInit,
          });
          resolve(response);
        } catch (responseError) {
          reject(new Error(`Failed to create response: ${responseError}`));
        }
      });
    });

    req.on('error', (error: Error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const config = getUAEPassConfig();

  // Debug: Log token exchange request (sensitive data masked by logger)
  logger.debug('Token exchange request:', {
    endpoint: config.tokenEndpoint,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_length: code.length,
    code_verifier_length: codeVerifier.length,
  });

  // Build request body with all credentials
  // UAE PASS expects credentials in the body, not in Basic Auth header
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  // Only add code_verifier if PKCE was used (check if it's not empty)
  if (codeVerifier && codeVerifier.length > 0) {
    params.append('code_verifier', codeVerifier);
  }

  logger.debug('Request body params configured (secrets masked)');

  try {
    // Log the endpoint being called for debugging
    logger.debug('Calling token endpoint:', config.tokenEndpoint);
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Make the token request with timeout and retry logic
      const response = await fetchWithRetry(
        config.tokenEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: params.toString(),
          signal: controller.signal,
        },
        3 // max retries
      );

      clearTimeout(timeoutId);

      const responseText = await response.text();
      logger.debug('Token response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        logger.error('Token exchange error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          error_description: errorData.error_description,
          responseBody: responseText.substring(0, 500), // First 500 chars
        });

        // If we get invalid_client, suggest checking credentials
        if (errorData.error === 'invalid_client') {
          logger.error('INVALID CLIENT: Verify client_id and client_secret match your UAE PASS environment (staging vs production)');
        }

        throw new Error(
          errorData.error_description ||
          errorData.error ||
          `Token exchange failed with status ${response.status}: ${response.statusText}`
        );
      }

      const tokens: TokenResponse = JSON.parse(responseText);
      logger.info('Token exchange successful');

      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      return tokens;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle abort (timeout)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        logger.error('Token exchange timeout:', {
          endpoint: config.tokenEndpoint,
          timeout: '30s',
        });
        throw new Error('Token exchange timed out after 30 seconds. Please check your network connection and try again.');
      }
      
      // Re-throw to be handled by outer catch
      throw fetchError;
    }
  } catch (error) {
    // Enhanced error handling with more context
    logger.error('Token exchange catch block - error details:', {
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorCause: error instanceof Error ? error.cause : undefined,
      endpoint: config.tokenEndpoint,
    });

    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      logger.error('Network error during token exchange:', {
        endpoint: config.tokenEndpoint,
        error: error.message,
        cause: error.cause,
        stack: error.stack,
      });
      throw new Error(
        `Failed to connect to UAE PASS token endpoint. ` +
        `Please verify: 1) Network connectivity, 2) Token endpoint URL is correct (${config.tokenEndpoint}), ` +
        `3) SSL/TLS certificate is valid, 4) No firewall/proxy blocking the request. ` +
        `5) DNS can resolve ${new URL(config.tokenEndpoint).hostname}. ` +
        `Original error: ${error.message}`
      );
    }
    
    if (error instanceof Error) {
      // If error message already contains our custom message, just re-throw
      if (error.message.includes('Token exchange') || error.message.includes('Failed to connect') || error.message.includes('timed out')) {
        throw error;
      }
      throw new Error(`Failed to exchange code for tokens: ${error.message}`);
    }
    throw new Error('Failed to exchange code for tokens: Unknown error');
  }
}

/**
 * Validate ID token signature and claims
 * Reference: OpenID Connect Core 1.0 - ID Token Validation
 */
export async function validateIdToken(
  idToken: string,
  expectedNonce: string
): Promise<JWTPayload> {
  const config = getUAEPassConfig();

  try {
    // Fetch JWKS (JSON Web Key Set) from UAE PASS
    const JWKS = createRemoteJWKSet(new URL(config.jwksUri));

    // Verify the ID token signature and decode it
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: config.issuer,
      audience: config.clientId,
    });

    // Validate nonce
    if (payload.nonce !== expectedNonce) {
      throw new Error('ID token nonce does not match expected nonce');
    }

    // Validate expiration (jwtVerify already checks exp, but we can add custom checks)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('ID token has expired');
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`ID token validation failed: ${error.message}`);
    }
    throw new Error('ID token validation failed: Unknown error');
  }
}

/**
 * Fetch user information from UAE PASS UserInfo endpoint
 * Reference: OpenID Connect Core 1.0 - UserInfo Endpoint
 */
export async function fetchUserInfo(accessToken: string): Promise<UAEPassUserProfile> {
  const config = getUAEPassConfig();

  try {
    const response = await fetch(config.userInfoEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description ||
        errorData.error ||
        `UserInfo request failed with status ${response.status}`
      );
    }

    const userInfo: UAEPassUserProfile = await response.json();
    return userInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
    throw new Error('Failed to fetch user info: Unknown error');
  }
}

/**
 * Normalize UAE PASS user profile to our application's user profile format
 * 
 * UAE PASS field names (as per documentation):
 * - firstnameEN, firstnameAR
 * - lastnameEN, lastnameAR
 * - fullnameEN, fullnameAR
 * - nationalityEN, nationalityAR
 * - dob (date of birth)
 * - gender
 * - mobile
 * - email
 * - idn (Emirates ID)
 * - uuid (user unique ID)
 * - sub (subject identifier)
 */
export function normalizeUserProfile(profile: UAEPassUserProfile): NormalizedUserProfile {
  // UAE PASS uses specific field names - prioritize those first
  const firstName =
    profile.firstnameEN ||     // UAE PASS primary field
    profile.firstnameAR ||     // UAE PASS Arabic field
    profile.firstName ||       // Alternative naming
    profile.given_name ||      // OIDC standard
    '';

  const lastName =
    profile.lastnameEN ||      // UAE PASS primary field
    profile.lastnameAR ||      // UAE PASS Arabic field
    profile.lastName ||        // Alternative naming
    profile.family_name ||     // OIDC standard
    '';

  const fullName =
    profile.fullnameEN ||      // UAE PASS primary field
    profile.fullnameAR ||      // UAE PASS Arabic field
    profile.fullName ||        // Alternative naming
    `${firstName} ${lastName}`.trim() ||
    profile.name ||
    '';

  // Emirates ID (idn) - only available for verified accounts (SOP2, SOP3)
  // Do NOT fall back to 'sub' as that's the UUID, not Emirates ID
  const emiratesId =
    profile.idn ||             // UAE PASS primary field (Emirates ID)
    profile.emiratesId ||      // Alternative naming
    '';

  const mobile =
    profile.mobile ||          // UAE PASS primary field
    profile.phoneNumber ||
    profile.phone ||
    '';

  const email =
    profile.email ||           // UAE PASS primary field
    profile.emailAddress ||
    '';

  // UAE PASS uses 'dob' for date of birth
  const dateOfBirth =
    profile.dob ||             // UAE PASS primary field
    profile.dateOfBirth ||     // Alternative naming
    profile.birthdate ||       // OIDC standard
    '';

  // UAE PASS uses 'nationalityEN' for nationality
  const nationality =
    profile.nationalityEN ||   // UAE PASS primary field
    profile.nationalityAR ||   // UAE PASS Arabic field
    profile.nationality ||     // Alternative naming
    profile.country ||
    '';

  // Extract UUID from UAE PASS response
  // In OIDC, 'sub' (subject identifier) is typically the UUID
  // UAE PASS may also provide 'uuid' field explicitly
  const uuid =
    profile.uuid ||            // UAE PASS explicit UUID field
    profile.sub ||             // OIDC subject identifier (usually the UUID)
    undefined;

  // Extract user type from various possible field names
  // UAE PASS may return this in different fields depending on the version/environment
  const rawUserType = 
    profile.userType ||           // Primary field name
    profile.user_type ||          // Snake case variant
    profile.profileType ||        // Alternative field name
    profile.profile_type ||       // Snake case variant
    profile.assuranceLevel ||     // Assurance level
    profile.assurance_level ||    // Snake case variant
    profile.sopLevel ||           // Direct SOP level
    profile.sop_level ||          // Snake case variant
    undefined;

  // Log available fields for debugging
  logger.debug('Raw userType value:', rawUserType);
  logger.debug('Available profile fields:', Object.keys(profile));

  // Determine user type from the extracted value, ACR, or Emirates ID fallback
  const userType = determineSOPLevel(rawUserType, profile.acr, emiratesId);

  return {
    fullName: fullName || 'N/A',
    firstName: firstName || 'N/A',
    lastName: lastName || 'N/A',
    emiratesId: emiratesId || 'N/A',
    mobile: mobile || 'N/A',
    email: email || 'N/A',
    dateOfBirth: dateOfBirth || undefined,
    nationality: nationality || undefined,
    sub: profile.sub,
    uuid: uuid,
    acr: profile.acr,
    userType: userType,
  };
}

/**
 * Determine SOP level from userType field, ACR claim, or Emirates ID presence
 * 
 * UAE PASS may return user type in multiple ways:
 * 1. Direct userType field: "SOP1", "SOP2", "SOP3"
 * 2. ACR claim with URN values:
 *    - urn:safelayer:tws:policies:authentication:level:low = SOP1 (Basic/Unverified)
 *    - urn:safelayer:tws:policies:authentication:level:substantial = SOP2 (Verified)
 *    - urn:safelayer:tws:policies:authentication:level:high = SOP3 (Fully Verified)
 * 3. Inference from Emirates ID presence (fallback)
 * 
 * @param userType - Direct userType from userInfo (e.g., "SOP1", "SOP2", "SOP3")
 * @param acr - ACR claim from ID token
 * @param emiratesId - Emirates ID for fallback inference (optional)
 */
export function determineSOPLevel(userType?: string, acr?: string, emiratesId?: string): SOPLevel {
  // First check if userType is directly provided (most common in UAE PASS)
  if (userType) {
    const upperUserType = userType.toUpperCase();
    if (upperUserType === 'SOP1') return 'SOP1';
    if (upperUserType === 'SOP2') return 'SOP2';
    if (upperUserType === 'SOP3') return 'SOP3';
    
    // Log for debugging
    logger.debug('Direct userType value:', userType);
  }

  // Fall back to ACR claim
  if (acr) {
    switch (acr) {
      case ACR_VALUES.SOP1:
        return 'SOP1';
      case ACR_VALUES.SOP2:
        return 'SOP2';
      case ACR_VALUES.SOP3:
        return 'SOP3';
      default:
        logger.debug('Unknown ACR value:', acr);
    }
  }

  // Final fallback: Determine by Emirates ID presence
  // If Emirates ID is present and valid (15 digits), user is at least SOP2
  // If no Emirates ID, user is likely SOP1 (unverified)
  if (emiratesId && emiratesId.length === 15 && /^\d+$/.test(emiratesId)) {
    logger.info('Determining SOP level from Emirates ID presence - inferred SOP2');
    return 'SOP2'; // Emirates ID verified = at least SOP2
  }

  logger.warn('Could not determine SOP level from userType:', userType, 'or acr:', acr, 'or emiratesId');
  return 'UNKNOWN';
}

/**
 * Validate user type - returns error message if user type is unknown/invalid
 * Returns null if user type is valid (SOP1, SOP2, or SOP3)
 */
export function validateUserType(userType?: SOPLevel): string | null {
  if (!userType || userType === 'UNKNOWN') {
    return 'Unknown user type. Your UAE PASS account type is not recognized. Please contact support or try again with a valid UAE PASS account.';
  }
  return null; // Valid user type
}




