/**
 * Callback Handler Component
 * 
 * Client component that processes the UAE PASS callback
 * First gets user info from UAE PASS, then shows confirmation screen
 * User clicks button to proceed with CRM integration
 */

'use client';

import { useEffect, useState } from 'react';
import { processUAEPassAuth, UAEPassAuthResult } from '@/app/actions/uaePassAuth';
import UserConfirmation from '@/components/UserConfirmation';
import { NormalizedUserProfile } from '@/lib/uaePass';

interface CallbackHandlerProps {
  code: string;
  state: string;
}

export default function CallbackHandler({ code, state }: CallbackHandlerProps) {
  const [status, setStatus] = useState<'processing' | 'confirming' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<NormalizedUserProfile | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        console.log('[UI] Processing UAE PASS callback...');
        const result: UAEPassAuthResult = await processUAEPassAuth(code, state);
        console.log('[UI] UAE PASS auth result:', result);

        if (result.success && result.user) {
          // Check if Emirates ID is missing (SOP1 scenario)
          const isSOP1 = !result.user.emiratesId || 
                        result.user.emiratesId === 'N/A' || 
                        result.user.emiratesId === '';
          
          if (isSOP1) {
            // SOP1 users - show error message only, no user info or buttons
            setStatus('error');
            setError('SOP1_ERROR'); // Special flag for SOP1 error
          } else {
            // SOP2/SOP3 users - show confirmation screen with user info
            console.log('[UI] User info received, showing confirmation screen');
            setUser(result.user);
            setStatus('confirming');
          }
        } else {
          setStatus('error');
          setError(result.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('[UI] Callback error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    }

    processCallback();
  }, [code, state]);

  if (status === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Processing Authentication
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'confirming' && user) {
    return <UserConfirmation user={user} />;
  }

  // Error state
  const isSOP1Error = error === 'SOP1_ERROR';
  
  if (isSOP1Error) {
    // SOP1 error - show only message, no user info or buttons
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <svg
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Account Verification Required
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You are not eligible to access this service. Your UAE PASS account is not verified (SOP1). 
              You need to upgrade your account to SOP2 or SOP3 to access CMS Financial services.
            </p>
            <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 p-4 text-left">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>What you need to do:</strong>
              </p>
              <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                <li>Upgrade your UAE PASS account to verify your Emirates ID</li>
                <li>Contact UAE PASS support to complete the verification process</li>
                <li>Once verified, you can access CMS Financial services</li>
              </ul>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Other errors - show generic error message
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Failed
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <div className="mt-6">
            <a
              href="/uae-pass/login"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Try Again
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


