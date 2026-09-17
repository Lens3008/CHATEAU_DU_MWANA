import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/user';

export default async function AdminIndexPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Role-based redirection for security
  // CLIENT should not access admin areas at all
  if (user.role === 'CLIENT') {
    redirect('/dashboard');
  }
  
  // LOGISTICIAN goes to logistics (not analytics)
  if (user.role === 'LOGISTICIAN') {
    redirect('/admin/logistics');
  }
  
  // SECRETARY goes to reservations (commercial focus)
  if (user.role === 'SECRETARY') {
    redirect('/admin/reservations');
  }
  
  // SUPERVISOR and ADMIN can access analytics
  redirect('/admin/analytics');
}
