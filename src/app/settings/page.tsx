import { redirect } from 'next/navigation';

// Redirect the root settings page to the profile settings
export default function SettingsPage() {
  redirect('/settings/profile');
}
