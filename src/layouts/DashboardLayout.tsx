import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import {
  Activity,
  Briefcase,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems?: { label: string; href: string; icon?: React.ReactNode }[]
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, sidebarItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const currentPath = router.pathname

  const getDefaultIcon = (href: string) => {
    if (href.includes('/admin/users')) return <Users className="h-5 w-5" />
    if (href.includes('/admin/applications')) return <Briefcase className="h-5 w-5" />
    if (href.includes('/admin/interviews')) return <CalendarDays className="h-5 w-5" />
    if (href.includes('/admin/payments')) return <DollarSign className="h-5 w-5" />
    if (href.includes('/admin/audit')) return <ClipboardList className="h-5 w-5" />
    if (href.includes('/admin/settings')) return <Settings className="h-5 w-5" />
    if (href.includes('/admin/messages')) return <MessageSquare className="h-5 w-5" />
    if (href.includes('/admin/top-candidates')) return <ShieldCheck className="h-5 w-5" />
    return <LayoutDashboard className="h-5 w-5" />
  }

  const cleanLabel = (label: string) => label.replace(/^[^A-Za-z0-9]+/, '').trim()
  const safeSidebarItems = sidebarItems || []

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 overflow-hidden">
      <Navbar />

      <div className="relative lg:flex lg:items-stretch">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950 text-slate-100 shadow-2xl transition-all duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}>
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-950 shadow-lg">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Airswift Admin</p>
                  <h1 className="text-lg font-semibold text-white">Management Panel</h1>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">Fast access to users, applications, payments and reporting.</p>
            </div>

            <nav className="mt-6 px-3 pb-10">
              <div className="space-y-1">
                {safeSidebarItems.map((item) => {
                  const isActive = currentPath === item.href || currentPath.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-white/10 text-white' : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-white'}`}>
                        {item.icon || getDefaultIcon(item.href)}
                      </span>
                      <span>{cleanLabel(item.label)}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        <div className="flex-1 lg:pl-72">
          <div className="sticky top-[72px] z-20 border-b border-slate-200 bg-slate-100 px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <Activity className="h-4 w-4" />
              Admin Menu
            </button>
          </div>

          <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-screen-2xl space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
