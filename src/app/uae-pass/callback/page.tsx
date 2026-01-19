/**
 * UAE PASS Callback Page
 * 
 * Handles the OAuth 2.0 callback from UAE PASS.
 * Uses a client component to process the callback via Server Action
 * (Server Actions can modify cookies, unlike Server Components during render)
 */

import CallbackHandler from '@/components/CallbackHandler';

interface CallbackPageProps {
  searchParams: Promise<{
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const params = await searchParams;

  // Handle cancellation from UAE PASS
  if (params.error === 'access_denied' || params.error === 'user_cancelled' || params.error === 'cancelled') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Cancelled
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You cancelled the UAE PASS authentication. No changes have been made to your account.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/uae-pass/login"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle other error responses from UAE PASS
  if (params.error) {
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
         User cancelled the Login
            </h1>
            {/* <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {params.error_description || params.error || 'An unknown error occurred'}
            </p> */}
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/10 p-3">
              {/* <p className="text-xs text-red-700 dark:text-red-300 font-mono">
                Error Code: {params.error}
              </p> */}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/uae-pass/login"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validate that we have the authorization code
  if (!params.code || !params.state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50 dark:bg-gray-900">
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
              Missing Parameters
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No authorization code or state was provided in the callback.
            </p>
            <div className="mt-6">
              <a
                href="/uae-pass/login"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Process the callback with the client component
  return <CallbackHandler code={params.code} state={params.state} />;
}
