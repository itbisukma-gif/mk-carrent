
import { redirect } from 'next/navigation';

export default function DashboardRedirectLayout() {
  // This layout now only serves to redirect from the old /dashboard path
  // to the new secret admin path if it is defined.
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/dashboard';
  redirect(adminPath);
}
