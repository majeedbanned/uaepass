/**
 * User Confirmation Component
 * 
 * Displays UAE PASS user information and allows user to confirm before proceeding with CRM integration
 */

'use client';

import { NormalizedUserProfile } from '@/lib/uaePass';
import { useState } from 'react';
import { processCRMIntegration } from '@/app/actions/crmIntegration';

interface UserConfirmationProps {
  user: NormalizedUserProfile;
}

export default function UserConfirmation({ user }: UserConfirmationProps) {
  const [status, setStatus] = useState<'confirming' | 'processing' | 'redirecting' | 'error'>('confirming');
  const [error, setError] = useState<string | null>(null);
  const [crmLoginUrl, setCrmLoginUrl] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  async function handleConfirm() {
    setStatus('processing');
    setError(null);

    try {
      const result = await processCRMIntegration();

      if (result.success && result.crmLoginUrl) {
        setIsNewUser(result.isNewCRMUser || false);
        setCrmLoginUrl(result.crmLoginUrl);
        setStatus('redirecting');

        // Redirect to CRM after short delay
        setTimeout(() => {
          window.location.href = result.crmLoginUrl!;
        }, 1500);
      } else {
        setStatus('error');
        setError(result.error || 'Failed to connect to CRM. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }

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
              Connecting to CRM...
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please wait while we process your request.
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

  if (status === 'error') {
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
              Connection Failed
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={handleConfirm}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
              <a
                href="/uae-pass/login"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Start Over
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation state - show user info
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
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
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Authentication Successful
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please verify your information below and confirm to continue
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-xl dark:bg-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Information</h2>
                <p className="mt-1 text-sm text-blue-100">Verified by UAE PASS</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {user.fullName}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Emirates ID</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {user.emiratesId}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {user.mobile}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {user.email}
                </dd>
              </div>

              {user.dateOfBirth && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date of Birth
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {user.dateOfBirth}
                  </dd>
                </div>
              )}

              {user.nationality && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationality</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {user.nationality}
                  </dd>
                </div>
              )}

              {user.sub && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd className="mt-1 text-sm font-mono text-gray-600 dark:text-gray-400">
                    {user.sub}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Confirm and Continue to CMS Financial
                </button>
                <a
                  href="/uae-pass/login"
                  className="w-full flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel and Start Over
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

