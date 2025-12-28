/**
 * Profile Display Component
 * 
 * Displays authenticated user's UAE PASS profile information
 */

import { NormalizedUserProfile } from '@/lib/uaePass';
import { logout } from '@/app/actions/auth';

interface ProfileDisplayProps {
  user: NormalizedUserProfile;
}

export default function ProfileDisplay({ user }: ProfileDisplayProps) {

  return (
    <div className="rounded-2xl bg-white shadow-xl dark:bg-gray-800 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">User Profile</h2>
            <p className="mt-1 text-sm text-blue-100">UAE PASS Authenticated</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
          {/* Primary info: First Name, Last Name, Nationality, Birthday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</dt>
              <dd className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {user.firstName}
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</dt>
              <dd className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {user.lastName}
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationality</dt>
              <dd className="mt-1 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {user.nationality || 'N/A'}
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
              <dd className="mt-1 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {user.dateOfBirth || 'N/A'}
              </dd>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Additional Information</h3>
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
        </dl>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

