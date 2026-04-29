import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import AdminLayout from '@/layouts/AdminLayout'
import Loader from '@/components/Loader'
import api from '@/lib/api'

interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: string
  isVerified?: boolean
  createdAt: string
}

interface EditFormData {
  name: string
  email: string
  role: string
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    email: '',
    role: ''
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📡 Fetching users from adminService...')
      
      const response = await adminService.getUsers()
      console.log('✅ Users fetched:', response)
      
      // Handle both direct array and wrapped response
      const userData = Array.isArray(response) ? response : response?.users || []
      setUsers(userData)
    } catch (err: any) {
      console.error('❌ Error fetching users:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load users'
      setError(errorMessage)
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    fetchUsers()
  }

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role
    })
    setEditModalOpen(true)
    setActionError(null)
  }

  // Close edit modal
  const closeEditModal = () => {
    setEditModalOpen(false)
    setSelectedUser(null)
    setEditFormData({ name: '', email: '', role: '' })
    setActionError(null)
    setSuccessMessage(null)
  }

  // Open delete modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setDeleteModalOpen(true)
    setActionError(null)
  }

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedUser(null)
    setActionError(null)
    setSuccessMessage(null)
  }

  // Handle edit form change
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)
      setActionError(null)

      const response = await api.put(`/admin/users/${selectedUser._id || selectedUser.id}`, editFormData)
      
      // Update the users list with the updated user
      setUsers(prev => prev.map(u => 
        (u._id === selectedUser._id || u.id === selectedUser.id) 
          ? { ...u, ...editFormData }
          : u
      ))

      setSuccessMessage('✅ User updated successfully!')
      console.log('✅ User persisted to database:', response.data)
      
      setTimeout(() => {
        closeEditModal()
        fetchUsers()
      }, 1500)
    } catch (err: any) {
      console.error('❌ Error updating user:', err)
      setActionError(err.response?.data?.message || 'Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)
      setActionError(null)

      const response = await api.delete(`/admin/users/${selectedUser._id || selectedUser.id}`)

      // Remove the deleted user from the list
      setUsers(prev => prev.filter(u => 
        (u._id !== selectedUser._id && u.id !== selectedUser.id)
      ))

      setSuccessMessage('✅ User deleted successfully!')
      console.log('✅ User deleted from database:', response.data)
      
      setTimeout(() => {
        closeDeleteModal()
        fetchUsers()
      }, 1500)
    } catch (err: any) {
      console.error('❌ Error deleting user:', err)
      setActionError(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ↻ Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: User) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'recruiter'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {user.isVerified ? '✓ Verified' : '✗ Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {actionError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {actionError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  {successMessage}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="job-seeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {actionError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {actionError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  {successMessage}
                </div>
              )}

              <div className="mb-6">
                <p className="text-gray-700 mb-4">⚠️ Are you sure you want to delete this user?</p>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-sm text-gray-600"><strong>Name:</strong> {selectedUser.name}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {selectedUser.email}</p>
                </div>
                <p className="text-red-600 text-sm mt-4">⚠️ This action cannot be undone.</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={closeDeleteModal}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsers
