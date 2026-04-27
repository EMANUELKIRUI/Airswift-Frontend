import { useEffect, useState } from "react";
import socket from '@/services/socket'
import { useNotification } from '@/context/NotificationContext'
import { adminService } from '@/services/adminService'
import API from '@/services/apiClient';

export default function AdminSettings() {
  const [form, setForm] = useState({
    platformName: "",
    currency: "USD",
    rateLimits: {
      maxJobsPerDay: 50,
      maxApplicationsPerDay: 100,
    },
    contact: {
      email: "",
      phone: "",
    },
    legal: {
      termsUrl: "",
      privacyUrl: "",
    },
    payment: {
      apiKey: "",
      mpesa: {
        consumerKey: "",
        consumerSecret: "",
        shortcode: "",
        passkey: "",
        callbackUrl: "",
      },
    },
    features: {
      emailNotifications: true,
      maintenanceMode: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { addNotification } = useNotification()

  // Auto-save settings with debounce
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const saveTimeout = setTimeout(async () => {
      try {
        setSaving(true)
        console.log('💾 Auto-saving settings...')
        await adminService.updateSettings(form)
        setLastSaved(new Date().toLocaleTimeString())
        console.log('✅ Settings auto-saved at', new Date().toLocaleTimeString())
        addNotification('✅ Settings auto-saved', 'success')
      } catch (error: any) {
        console.error('❌ Auto-save failed:', error?.response?.data || error?.message || error)
        addNotification('⚠️ Auto-save failed', 'error')
      } finally {
        setSaving(false)
      }
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(saveTimeout);
  }, [form, autoSaveEnabled, addNotification]);

  // 🔄 FETCH SETTINGS
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminService.getSettings()
        
        // Safely handle response structure and set defaults
        const settingsData = data?.data || data || {}
        
        // Merge with defaults to prevent undefined errors
        setForm(prev => ({
          ...prev,
          platformName: settingsData.platformName || prev.platformName || '',
          currency: settingsData.currency || prev.currency || 'USD',
          rateLimits: {
            maxJobsPerDay: settingsData.rateLimits?.maxJobsPerDay ?? 50,
            maxApplicationsPerDay: settingsData.rateLimits?.maxApplicationsPerDay ?? 100,
          },
          contact: {
            email: settingsData.contact?.email || prev.contact.email || '',
            phone: settingsData.contact?.phone || prev.contact.phone || '',
          },
          legal: {
            termsUrl: settingsData.legal?.termsUrl || prev.legal.termsUrl || '',
            privacyUrl: settingsData.legal?.privacyUrl || prev.legal.privacyUrl || '',
          },
          payment: {
            apiKey: settingsData.payment?.apiKey || prev.payment.apiKey || '',
            mpesa: {
              consumerKey: settingsData.payment?.mpesa?.consumerKey || prev.payment.mpesa.consumerKey || '',
              consumerSecret: settingsData.payment?.mpesa?.consumerSecret || prev.payment.mpesa.consumerSecret || '',
              shortcode: settingsData.payment?.mpesa?.shortcode || prev.payment.mpesa.shortcode || '',
              passkey: settingsData.payment?.mpesa?.passkey || prev.payment.mpesa.passkey || '',
              callbackUrl: settingsData.payment?.mpesa?.callbackUrl || prev.payment.mpesa.callbackUrl || '',
            },
          },
          features: {
            emailNotifications: settingsData.features?.emailNotifications !== false,
            maintenanceMode: settingsData.features?.maintenanceMode === true,
          },
        }))
      } catch (error) {
        console.error('Error fetching settings:', error)
        addNotification('Failed to load settings', 'error')
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [addNotification])

  useEffect(() => {
    if (!socket) return

    const handleSettingsUpdated = (newSettings: any) => {
      console.log('🔄 Settings updated in real-time', newSettings)
      setForm(newSettings)
      addNotification('⚙️ Settings were updated in real time', 'info')
    }

    socket.on('settingsUpdated', handleSettingsUpdated)

    return () => {
      socket.off('settingsUpdated', handleSettingsUpdated)
    }
  }, [addNotification])

  // � FRONTEND PAYMENT BUTTON
  const handlePay = async () => {
    setPaymentProcessing(true);

    try {
      const res = await API.post("/payments/pay", {
        phone: "+2547XXXXXXXX",
        amount: 100,
      });

      const data = res.data;
      
      // ✅ ENHANCED SUCCESS MESSAGE
      alert("✅ Payment successful! Receipt sent to your email.");
      
      // Optional: Show receipt details
      console.log("Payment response:", data);
    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Payment failed");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // 💾 MANUAL SAVE SETTINGS
  const handleSave = async () => {
    setSaving(true)

    try {
      console.log('💾 Saving settings...', form)
      await adminService.updateSettings(form)
      setLastSaved(new Date().toLocaleTimeString())
      addNotification('✅ Settings saved successfully', 'success')
      console.log('✅ Settings saved successfully')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save settings'
      console.error('❌ Error saving settings:', errorMessage, error)
      addNotification(`❌ ${errorMessage}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">⚙️ Admin Settings</h1>
        <div className="flex items-center gap-4">
          {/* Auto-save Status */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Auto-save:</label>
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                autoSaveEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {autoSaveEnabled ? '✅ ON' : '⭕ OFF'}
            </button>
          </div>

          {/* Saving Indicator */}
          {saving && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin">💾</div>
              <span className="text-sm font-medium">Saving...</span>
            </div>
          )}

          {/* Last Saved Time */}
          {lastSaved && !saving && (
            <div className="text-sm text-gray-500">
              Last saved: {lastSaved}
            </div>
          )}

          {/* Manual Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : '💾 Save Now'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📱 Platform Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform Name</label>
              <input
                type="text"
                value={form.platformName}
                onChange={(e) =>
                  setForm({ ...form, platformName: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="KES">KES</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">⚡ Rate Limits</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Jobs Per Day
              </label>
              <input
                type="number"
                value={form.rateLimits.maxJobsPerDay}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rateLimits: {
                      ...form.rateLimits,
                      maxJobsPerDay: Number(e.target.value),
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Applications Per Day
              </label>
              <input
                type="number"
                value={form.rateLimits.maxApplicationsPerDay}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rateLimits: {
                      ...form.rateLimits,
                      maxApplicationsPerDay: Number(e.target.value),
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📧 Contact Info</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.contact.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact: { ...form.contact, email: e.target.value },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={form.contact.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact: { ...form.contact, phone: e.target.value },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Legal Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">⚖️ Legal</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Terms URL</label>
              <input
                type="url"
                value={form.legal.termsUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    legal: { ...form.legal, termsUrl: e.target.value },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Privacy URL
              </label>
              <input
                type="url"
                value={form.legal.privacyUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    legal: { ...form.legal, privacyUrl: e.target.value },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">💳 Payment Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                value={form.payment.apiKey}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment: { ...form.payment, apiKey: e.target.value },
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="••••••••••••"
              />
            </div>
          </div>
        </div>

        {/* M-Pesa Settings */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📱 M-Pesa Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Consumer Key</label>
              <input
                type="password"
                value={form.payment.mpesa.consumerKey}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment: {
                      ...form.payment,
                      mpesa: { ...form.payment.mpesa, consumerKey: e.target.value },
                    },
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Consumer Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Consumer Secret</label>
              <input
                type="password"
                value={form.payment.mpesa.consumerSecret}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment: {
                      ...form.payment,
                      mpesa: { ...form.payment.mpesa, consumerSecret: e.target.value },
                    },
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Consumer Secret"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Shortcode</label>
              <input
                type="text"
                value={form.payment.mpesa.shortcode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment: {
                      ...form.payment,
                      mpesa: { ...form.payment.mpesa, shortcode: e.target.value },
                    },
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Shortcode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passkey</label>
              <input
                type="password"
                value={form.payment.mpesa.passkey}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment: {
                      ...form.payment,
                      mpesa: { ...form.payment.mpesa, passkey: e.target.value },
                    },
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Passkey"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Callback URL</label>
              <input
                type="url"
                value={form.payment.mpesa.callbackUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment: {
                      ...form.payment,
                      mpesa: { ...form.payment.mpesa, callbackUrl: e.target.value },
                    },
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Callback URL"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">✨ Features</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.features.emailNotifications}
                onChange={(e) =>
                  setForm({
                    ...form,
                    features: {
                      ...form.features,
                      emailNotifications: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Email Notifications</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.features.maintenanceMode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    features: {
                      ...form.features,
                      maintenanceMode: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Maintenance Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Status Footer */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          {autoSaveEnabled 
            ? '✅ Auto-save is enabled. Your changes will be saved automatically 2 seconds after you stop making changes.'
            : '⭕ Auto-save is disabled. Use the "Save Now" button in the header to manually save your changes.'}
        </p>
        {lastSaved && (
          <p className="text-xs text-blue-600 mt-2">
            Last saved at {lastSaved}
          </p>
        )}
      </div>
    </div>
  );
}
