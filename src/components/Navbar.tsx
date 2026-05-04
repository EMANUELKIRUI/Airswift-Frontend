import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { Menu, X, Plane, LogOut, LayoutDashboard, Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const isAuthenticated = !!user
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      const resolvedTheme = storedTheme || 'dark'
      setTheme(resolvedTheme)
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    }
  }, [])

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer flex-shrink-0">
          <div className="bg-primary p-1.5 sm:p-2 rounded-lg group-hover:shadow-md transition-all">
            💼
          </div>
          <span className="hidden sm:inline text-lg sm:text-xl lg:text-2xl font-bold text-primary">
            TALEX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link
                href={user?.role === 'admin' ? '/admin/jobs' : '/jobs'}
                className="text-gray-600 hover:text-primary transition font-medium flex items-center gap-2 text-sm lg:text-base"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              {/* Admin-only navigation */}
              {user?.role === 'admin' && (
                <Link
                  href="/admin/jobs"
                  className="text-orange-600 hover:text-orange-700 transition font-medium flex items-center gap-2 text-sm lg:text-base"
                >
                  <span className="text-sm">⚙️</span>
                  Admin Panel
                </Link>
              )}
            </>
          ) : (
            <></>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition touch-safe"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-danger hover:bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-red-500/30 text-sm touch-safe"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-primary hover:text-primary-dark px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-primary transition text-sm font-medium touch-safe"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-primary-dark text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg transition-all hover:shadow-lg text-sm font-medium touch-safe"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-600 hover:text-primary transition p-2 touch-safe"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 lg:hidden rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition touch-safe"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden bg-gray-50 border-t border-gray-200 overflow-y-auto max-h-[calc(100vh-70px)]"
        >
          <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="mb-4 flex items-center gap-2 sm:gap-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{user?.email}</span>
                </div>

                <Link
                  href={user?.role === 'admin' ? '/admin/jobs' : '/jobs'}
                  className="block px-3 py-2.5 sm:py-3 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition flex items-center gap-2 text-sm font-medium touch-safe"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span className="truncate">Dashboard</span>
                </Link>

                {/* Admin-only mobile navigation */}
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/jobs"
                    className="block px-3 py-2.5 sm:py-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition flex items-center gap-2 text-sm font-medium touch-safe"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="text-lg">⚙️</span>
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-danger hover:bg-red-600 text-white px-3 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-3 text-sm font-medium touch-safe"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2.5 sm:py-3 text-primary border border-primary rounded-lg hover:bg-green-50 transition text-center text-sm font-medium touch-safe"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="block px-3 py-2.5 sm:py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-center text-sm font-medium touch-safe"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar
