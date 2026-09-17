import { requireAuth } from '@/lib/auth/user'
import { redirect } from 'next/navigation'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth().catch(() => null)
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-admin-bg)] text-slate-900 selection:bg-[var(--color-admin-primary)] selection:text-white">
      <AppSidebar userRole={user.role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
