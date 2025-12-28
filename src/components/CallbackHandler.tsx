/**
 * Callback Handler Component
 * 
 * Client component that processes the UAE PASS callback
 * by calling a Server Action (which can modify cookies)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { processUAEPassCallback, CallbackResult } from '@/app/actions/uaePassCallback';

interface CallbackHandlerProps {
  code: string;
  state: string;
}

export default function CallbackHandler({ code, state }: CallbackHandlerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'redirecting' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [crmLoginUrl, setCrmLoginUrl] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        console.log('[UI] Processing callback...');
        const result: CallbackResult = await processUAEPassCallback(code, state);
        console.log('[UI] Callback result:', result);

        if (result.success) {
          // Check if we have a CRM login URL
          if (result.crmLoginUrl) {
            console.log('[UI] CRM login URL received, redirecting to CRM...');
            setIsNewUser(result.isNewCRMUser || false);
            setCrmLoginUrl(result.crmLoginUrl);
            setStatus('redirecting');
            
            // Redirect to CRM login URL after short delay
            setTimeout(() => {
              console.log('[UI] Redirecting to:', result.crmLoginUrl);
              window.location.href = result.crmLoginUrl!;
            }, 1500);
          } else {
            // No CRM URL, fallback to profile page
            console.log('[UI] No CRM URL, redirecting to profile...');
            setStatus('success');
            setTimeout(() => {
              router.push('/uae-pass/profile');
            }, 1000);
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
  }, [code, state, router]);

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

  if (status === 'redirecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {isNewUser ? 'Account Created!' : 'Welcome Back!'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isNewUser 
                ? 'Your account has been created. Redirecting to CMS Financial...'
                : 'Redirecting to CMS Financial...'}
            </p>
            <div className="mt-4">
              <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full w-full origin-left animate-pulse bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Successful!
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Redirecting to your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
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


