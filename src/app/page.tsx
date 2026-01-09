import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            UAE PASS Authentication
          </h1>
          <p className="max-w-md text-lg leading-8 text-gray-600 dark:text-gray-400">
            Secure authentication using UAE PASS. Sign in with your UAE PASS credentials to access your profile.
          </p>
          
          {session ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {session.user.fullName}!
              </p>
              <Link
                href="/uae-pass/profile"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <Link
              href="/uae-pass/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Sign in with UAE PASS
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
