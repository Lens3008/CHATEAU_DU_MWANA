'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  PackageSearch,
  Settings,
  TicketCheck,
  Building,
  Menu,
  X,
  BarChart3,
  MessageSquare,
  FileText
} from 'lucide-react'
import { useState } from 'react'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" aria-label="Tableau de bord" />,
    roles: ['ADMIN', 'SUPERVISOR', 'SECRETARY', 'LOGISTICIAN', 'CLIENT'],
  },
  {
    label: 'Mes réservations',
    href: '/dashboard/reservations',
    icon: <CalendarDays className="w-5 h-5" aria-label="Mes réservations" />,
    roles: ['CLIENT'],
  },
  {
    label: 'Réservations',
    href: '/admin/reservations',
    icon: <TicketCheck className="w-5 h-5" aria-label="Réservations" />,
    roles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" aria-label="Analytics" />,
    roles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
  },
  {
    label: 'CRM & Clients',
    href: '/admin/crm',
    icon: <Users className="w-5 h-5" aria-label="CRM & Clients" />,
    roles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
  },
  {
    label: 'Catalogue',
    href: '/admin/catalogue',
    icon: <Building className="w-5 h-5" aria-label="Catalogue" />,
    roles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
  },
  {
    label: 'Logistique & Inventaire',
    href: '/admin/logistics',
    icon: <PackageSearch className="w-5 h-5" aria-label="Logistique & Inventaire" />,
    roles: ['ADMIN', 'SUPERVISOR', 'LOGISTICIAN'],
  },
  {
    label: 'CMS',
    href: '/admin/cms',
    icon: <FileText className="w-5 h-5" aria-label="CMS" />,
    roles: ['ADMIN', 'SUPERVISOR'],
  },
  {
    label: 'Messages Contact',
    href: '/admin/contact',
    icon: <MessageSquare className="w-5 h-5" aria-label="Messages Contact" />,
    roles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
  },
  {
    label: 'Imports',
    href: '/admin/imports',
    icon: <LayoutDashboard className="w-5 h-5" aria-label="Imports" />,
    roles: ['ADMIN', 'SUPERVISOR'],
  },
  {
    label: 'Utilisateurs',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" aria-label="Utilisateurs" />,
    roles: ['ADMIN', 'SUPERVISOR'],
  },
]

export default function AppSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const allowedItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole))

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
        aria-controls="sidebar"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        id="sidebar"
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] border-r border-slate-800 shadow-xl
        flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center group">
            <Image src="/images/logo.png" alt="Le Château du Mwana" width={120} height={40} className="object-contain" priority />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            <div className="px-3 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            {allowedItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                  `}
                >
                  <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/admin/cms/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          >
            <Settings className="w-5 h-5 text-slate-500" aria-label="Paramètres" />
            Paramètres
          </Link>
        </div>
      </aside>
    </>
  )
}
