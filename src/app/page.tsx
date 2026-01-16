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
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#00a651] hover:bg-[#008c44] px-8 py-4 text-lg font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a651]"
            >
              {/* UAE PASS Icon - Shield with UAE colors */}
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
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
