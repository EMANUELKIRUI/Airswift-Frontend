import React, { useState, useEffect } from 'react';
import api from '@/lib/api'; // ✅ Correct: using centralized API client

/**
 * AdminSettings Component - ENHANCED VERSION
 * 
 * Improvements over original:
 * ✅ Better error handling with user-friendly messages
 * ✅ Individual loading states for each operation
 * ✅ Retry mechanism for failed operations
 * ✅ Toast notifications for success/error
 * ✅ Validation before submit
 * ✅ API response logging for debugging
 * ✅ Comprehensive error recovery
 */

interface Setting {
  _id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  isPublic: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

interface UpdateState {
  [key: string]: {
    isUpdating: boolean;
    error: string | null;
  };
}

const AdminSettings = () => {
  // State management
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [updateStates, setUpdateStates] = useState<UpdateState>({});
  const [createLoading, setCreateLoading] = useState(false);
  
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
    isPublic: false,
  });

  const categories = ['general', 'security', 'email', 'payment', 'maintenance', 'features'];

  /**
   * ✅ ENHANCED: Toast notification system
   */
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, timestamp: Date.now() };
    
    setToasts(prev => [...prev, toast]);
    console.log(`📢 Toast [${type}]:`, message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  /**
   * ✅ FIXED: Fetch settings with enhanced error handling
   */
  const fetchSettings = async (retries = 3) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📡 Fetching settings for category: ${selectedCategory}`);
      
      const response = await api.get(`/settings/category/${selectedCategory}`);
      
      console.log(`✅ Settings loaded successfully:`, response.data);
      setSettings(response.data || []);
      showToast(`${selectedCategory} settings loaded`, 'success');
      
    } catch (err: any) {
      // Enhanced error handling
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      
      console.error(`❌ Error fetching settings:`, { status, message, error: err });
      
      // Determine user-friendly error message
      let errorMsg = 'Failed to load settings';
      
      if (status === 401) {
        errorMsg = 'Session expired. Please log in again.';
      } else if (status === 403) {
        errorMsg = 'You do not have permission to view settings.';
      } else if (status === 404) {
        errorMsg = 'Settings endpoint not found. Backend may be down.';
      } else if (status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (!err.response) {
        errorMsg = 'Network error. Check your connection.';
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
      
      // Retry logic
      if (retries > 0 && !status) {
        console.log(`🔄 Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchSettings(retries - 1), 2000);
      }
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ ENHANCED: Update setting with PUT method (NOT POST)
   */
  const updateSetting = async (key: string, value: any) => {
    // Validation
    if (!key || value === undefined) {
      showToast('Invalid setting key or value', 'error');
      return;
    }

    try {
      setUpdateStates(prev => ({
        ...prev,
        [key]: { isUpdating: true, error: null }
      }));

      console.log(`📤 Updating setting: ${key} = ${value}`);
      
      // ✅ IMPORTANT: Using PUT method (not POST) for updates
      const response = await api.put(`/settings/${key}`, { value });
      
      console.log(`✅ Setting updated successfully:`, response.data);
      
      // Update local state
      setSettings(prev => 
        prev.map(s => s.key === key ? { ...s, value } : s)
      );
      
      showToast(`Setting "${key}" updated successfully`, 'success');
      
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      
      console.error(`❌ Error updating setting:`, { status, message, error: err });
      
      let errorMsg = 'Failed to update setting';
      
      if (status === 400) {
        errorMsg = `Invalid value: ${message || 'Please check the value format'}`;
      } else if (status === 401) {
        errorMsg = 'Session expired. Please log in again.';
      } else if (status === 403) {
        errorMsg = 'You do not have permission to update settings.';
      } else if (status === 404) {
        errorMsg = `Setting "${key}" not found.`;
      } else if (status === 500) {
        errorMsg = 'Server error. Please try again later.';
      }
      
      setUpdateStates(prev => ({
        ...prev,
        [key]: { isUpdating: false, error: errorMsg }
      }));
      
      showToast(errorMsg, 'error');
      
    } finally {
      setUpdateStates(prev => ({
        ...prev,
        [key]: { ...prev[key], isUpdating: false }
      }));
    }
  };

  /**
   * ✅ ENHANCED: Create new setting with validation
   */
  const createSetting = async () => {
    // Validation
    if (!newSetting.key.trim()) {
      showToast('Setting key is required', 'error');
      return;
    }
    if (!newSetting.value.trim()) {
      showToast('Setting value is required', 'error');
      return;
    }

    try {
      setCreateLoading(true);
      
      console.log(`📝 Creating new setting:`, newSetting);
      
      const response = await api.post('/settings', newSetting);
      
      console.log(`✅ Setting created successfully:`, response.data);
      
      // Reset form
      setNewSetting({
        key: '',
        value: '',
        description: '',
        category: selectedCategory,
        isPublic: false,
      });
      
      // Refresh settings
      await fetchSettings();
      showToast(`Setting "${newSetting.key}" created`, 'success');
      
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      
      console.error(`❌ Error creating setting:`, { status, message, error: err });
      
      let errorMsg = 'Failed to create setting';
      
      if (status === 400) {
        errorMsg = `Invalid input: ${message || 'Check the setting values'}`;
      } else if (status === 409) {
        errorMsg = `Setting "${newSetting.key}" already exists.`;
      } else if (status === 403) {
        errorMsg = 'You do not have permission to create settings.';
      } else if (status === 500) {
        errorMsg = 'Server error. Please try again later.';
      }
      
      showToast(errorMsg, 'error');
      
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * ✅ ENHANCED: Delete setting with confirmation
   */
  const deleteSetting = async (key: string) => {
    if (!window.confirm(`Are you sure you want to delete setting "${key}"?`)) {
      return;
    }

    try {
      setUpdateStates(prev => ({
        ...prev,
        [key]: { isUpdating: true, error: null }
      }));

      console.log(`🗑️ Deleting setting: ${key}`);
      
      await api.delete(`/settings/${key}`);
      
      console.log(`✅ Setting deleted successfully`);
      
      // Update local state
      setSettings(prev => prev.filter(s => s.key !== key));
      
      showToast(`Setting "${key}" deleted`, 'success');
      
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      
      console.error(`❌ Error deleting setting:`, { status, message, error: err });
      
      let errorMsg = 'Failed to delete setting';
      
      if (status === 403) {
        errorMsg = 'You do not have permission to delete settings.';
      } else if (status === 404) {
        errorMsg = `Setting "${key}" not found.`;
      } else if (status === 500) {
        errorMsg = 'Server error. Please try again later.';
      }
      
      showToast(errorMsg, 'error');
      
    } finally {
      setUpdateStates(prev => ({
        ...prev,
        [key]: { isUpdating: false, error: null }
      }));
    }
  };

  /**
   * ✅ Load settings on category change
   */
  useEffect(() => {
    fetchSettings();
  }, [selectedCategory]);

  // Render states
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin - Settings</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin - Settings</h1>

      {/* ✅ Enhanced Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
          >
            {toast.type === 'success' && '✅ '}
            {toast.type === 'error' && '❌ '}
            {toast.type === 'info' && 'ℹ️ '}
            {toast.message}
          </div>
        ))}
      </div>

      {/* ✅ Enhanced Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Settings</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => { setError(null); fetchSettings(); }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                selectedCategory === category
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Setting */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Setting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Setting Key (e.g., siteName)"
            value={newSetting.key}
            onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={createLoading}
          />
          <input
            type="text"
            placeholder="Value"
            value={newSetting.value}
            onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={createLoading}
          />
          <input
            type="text"
            placeholder="Description"
            value={newSetting.description}
            onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={createLoading}
          />
          <select
            value={newSetting.category}
            onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={createLoading}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newSetting.isPublic}
              onChange={(e) => setNewSetting({ ...newSetting, isPublic: e.target.checked })}
              className="mr-2"
              disabled={createLoading}
            />
            Public
          </label>
          <button
            onClick={createSetting}
            disabled={createLoading}
            className={`px-4 py-2 rounded-md text-white font-medium transition-all ${
              createLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {createLoading ? 'Adding...' : 'Add Setting'}
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {settings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No settings found for "{selectedCategory}" category
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Public
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => (
                <tr key={setting._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {setting.key}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue={setting.value}
                        onChange={(e) => {
                          const updatedSettings = settings.map(s =>
                            s._id === setting._id ? { ...s, value: e.target.value } : s
                          );
                          setSettings(updatedSettings);
                        }}
                        onBlur={(e) => updateSetting(setting.key, e.target.value)}
                        disabled={updateStates[setting.key]?.isUpdating}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      {updateStates[setting.key]?.isUpdating && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </span>
                      )}
                    </div>
                    {updateStates[setting.key]?.error && (
                      <p className="text-red-500 text-xs mt-1">{updateStates[setting.key].error}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {setting.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      setting.isPublic
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {setting.isPublic ? '✅ Public' : '🔒 Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteSetting(setting.key)}
                      disabled={updateStates[setting.key]?.isUpdating}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono">
        <p>📊 Debug: {settings.length} settings loaded in "{selectedCategory}" category</p>
      </div>
    </div>
  );
};

export default AdminSettings;
