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

  // Handle error response from UAE PASS
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
              Authentication Failed
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {params.error_description || params.error || 'An unknown error occurred'}
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

  // Validate that we have the authorization code
  if (!params.code || !params.state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Missing Parameters
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No authorization code or state was provided in the callback.
            </p>
            <div className="mt-6">
              <a
                href="/uae-pass/login"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
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
