import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, LogOut, Search, User as UserIcon } from 'lucide-react'

export default function AppHeader({ user }: { user: any }) {
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 ring-red-600/20',
    SUPERVISOR: 'bg-purple-100 text-purple-800 ring-purple-600/20',
    SECRETARY: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    LOGISTICIAN: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    CLIENT: 'bg-stone-100 text-stone-800 ring-stone-600/20',
  }

  const roleLabel = user.role || 'CLIENT'
  const colorClass = roleColors[roleLabel] || roleColors['CLIENT']

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex-1 flex items-center gap-4">
        {/* Search bar - disabled for now as per BRIDGE 4.1 requirements */}
        <div className="hidden md:flex relative max-w-md w-full opacity-50 cursor-not-allowed">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            disabled
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none transition-all text-slate-900 cursor-not-allowed"
            aria-label="Rechercher (désactivé)"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 focus-ring-chateau" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900 leading-none">
              {user.name || user.email.split('@')[0]}
            </span>
            <span className={`mt-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${colorClass}`}>
              {roleLabel}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 ring-2 ring-white shadow-sm">
            <UserIcon className="w-5 h-5" />
          </div>
          
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
          }}>
            <button type="submit" className="ml-2 p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 focus-ring-chateau" title="Se déconnecter" aria-label="Se déconnecter">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
