import { getCurrentUser } from '@/lib/auth/user'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case 'ADMIN':
      redirect('/dashboard/admin')
    case 'SUPERVISOR':
      redirect('/dashboard/supervisor')
    case 'SECRETARY':
      redirect('/dashboard/secretary')
    case 'LOGISTICIAN':
      redirect('/dashboard/logistician')
    case 'CLIENT':
      redirect('/dashboard/client')
    default:
      redirect('/dashboard/client')
  }
}
