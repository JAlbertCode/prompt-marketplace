import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { checkServerAuth, redirectToLogin } from '@/lib/auth/helpers/serverAuth';

export default async function SettingsPage() {
  // Check authentication using our helper
  const { isAuthenticated } = await checkServerAuth();
  
  // Check for Supabase auth cookie explicitly - needs await in Next.js 15
  const cookieStore = await cookies();
  const supabaseAuth = cookieStore.get('supabase_auth');
  const isAuthenticatedByCookie = supabaseAuth && supabaseAuth.value === 'true';
  
  if (!isAuthenticated && !isAuthenticatedByCookie) {
    // Use server-side helper to redirect to login
    return redirectToLogin('/settings');
  }
  
  // Redirect to profile settings page if authenticated
  redirect('/settings/profile');
}
