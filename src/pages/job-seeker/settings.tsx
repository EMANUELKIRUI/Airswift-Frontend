"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/layouts/DashboardLayout'
import Loader from '@/components/Loader'
import { Settings } from 'lucide-react'
import API from '@/services/apiClient'
import AuthService from '@/services/authService'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [settings, setSettings] = useState({
    name: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    bio: '',
    emailNotifications: true,
    profileVisibility: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (user?.role?.toLowerCase() !== 'user' && user?.role?.toLowerCase() !== 'job-seeker') {
      router.push('/unauthorized')
      return
    }

    const fetchSettings = async () => {
      try {
        const res = await API.get('/profile')
        const data = res.data || {}
        setSettings({
          name: data.name || user.name || '',
          phone: data.phone || user.phone || '',
          location: data.location || user.location || '',
          linkedin: data.linkedin || '',
          portfolio: data.portfolio || '',
          bio: data.bio || '',
          emailNotifications: data.emailNotifications ?? true,
          profileVisibility: data.profileVisibility ?? true,
        })
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [user, isLoading, router])

  if (isLoading || loading) return <Loader fullScreen />

  const sidebarItems = [
    { label: '🏠 Dashboard', href: '/job-seeker/dashboard' },
    { label: '📤 Documents', href: '/job-seeker/documents' },
    { label: '📂 My Applications', href: '/job-seeker/applications' },
    { label: '🎤 Interviews', href: '/job-seeker/interviews' },
    { label: '💬 Messages', href: '/job-seeker/messages' },
    { label: '👤 Profile', href: '/job-seeker/profile' },
    { label: '⚙️ Settings', href: '/job-seeker/settings' },
  ]

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await API.post('/profile', settings)
      toast.success('Your account settings have been updated.')
    } catch (err: any) {
      console.error('Settings save failed:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.')
      return
    }

    setPasswordSaving(true)
    try {
      const result = await AuthService.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      if (result.success) {
        toast.success(result.message || 'Password changed successfully.')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(result.error || 'Failed to change password.')
      }
    } catch (err: any) {
      console.error('Password change failed:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to change password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <Settings className="w-14 h-14 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-sm text-slate-600">Manage your profile, security, and communication preferences.</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 mt-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 mt-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">LinkedIn Profile</label>
                <input
                  type="url"
                  value={settings.linkedin}
                  onChange={(e) => setSettings(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="https://www.linkedin.com/in/username"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Portfolio Website</label>
                <input
                  type="url"
                  value={settings.portfolio}
                  onChange={(e) => setSettings(prev => ({ ...prev, portfolio: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="https://www.yourportfolio.com"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700">Professional Bio</label>
              <textarea
                value={settings.bio}
                onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                placeholder="Summarize your experience, strengths, and what you're looking for in your next role."
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 mt-6">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Receive email updates and alerts</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={settings.profileVisibility}
                  onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Allow recruiters to view my profile</span>
              </label>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving settings...' : 'Save settings'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Security</h2>
            <p className="text-sm text-slate-600 mb-6">Change your password for added account security.</p>

            <div className="grid gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={passwordSaving}
                className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-6 py-3 text-white font-semibold shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {passwordSaving ? 'Updating password...' : 'Update password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
