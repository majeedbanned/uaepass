/**
 * UAE PASS Profile Page
 * 
 * Displays the authenticated user's profile information
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import ProfileDisplay from '@/components/ProfileDisplay';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/uae-pass/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your UAE PASS authenticated profile information
          </p>
        </div>

        <ProfileDisplay user={session.user} />
      </div>
    </div>
  );
}





