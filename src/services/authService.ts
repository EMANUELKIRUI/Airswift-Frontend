import api from '@/lib/api'
import { reconnectSocket, disconnectSocket } from '@/services/socket'

type OTPResult =
  | { success: true; token: string; user: User }
  | { success: false; error: string };

type User = {
  id: string;
  email: string;
  name?: string;
  user?: any;
  [key: string]: any;
};

class AuthService {
  static normalizeUser(user: User | null | undefined) {
    if (!user) return null

    const userPayload = user.user ? user.user : user
    const normalizedUser = { ...userPayload }

    // Normalize role casing and values
    if (normalizedUser.role) {
      normalizedUser.role = normalizedUser.role.toString().toLowerCase()
    }

    // Case-insensitive admin email fallback
    if (!normalizedUser.role && normalizedUser.email?.toLowerCase() === 'admin@talex.com') {
      normalizedUser.role = 'admin'
      console.log("📌 Normalized admin user based on email:", normalizedUser.email)
    }

    if (!normalizedUser.role && normalizedUser.email?.toLowerCase().includes('admin@talex.com')) {
      normalizedUser.role = 'admin'
    }

    // Normalize ID field
    if (!normalizedUser.id && normalizedUser._id) {
      normalizedUser.id = normalizedUser._id
    }

    return normalizedUser
  }

  static storeToken(token: string, user: User | null) {
    try {
      const normalizedUser = this.normalizeUser(user)
      localStorage.setItem('token', token)
      localStorage.setItem('accessToken', token)
      if (normalizedUser) {
        localStorage.setItem('user', JSON.stringify(normalizedUser))
      }
      if (normalizedUser?.role === 'admin') {
        localStorage.setItem('adminToken', token)
      }
      console.log('✅ Token stored successfully:', token?.substring(0, 20) + '...')
      return true
    } catch (error) {
      console.error('❌ Error storing token:', error)
      return false
    }
  }

  static extractAuthPayload(responseData: any) {
    const data = responseData || {}
    const token =
      data.token ||
      data.accessToken ||
      data.data?.token ||
      data.data?.accessToken

    const user =
      data.user ||
      data.data?.user ||
      (typeof data.data === 'object' ? data.data : null)

    return { token, user }
  }

  static getToken() {
    try {
      return localStorage.getItem('token')
    } catch (error) {
      console.error('❌ Error retrieving token:', error)
      return null
    }
  }

  static getUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('❌ Error retrieving user:', error)
      return null
    }
  }

  static isAuthenticated() {
    return this.getToken() !== null
  }

  static isAdmin() {
    const user = this.getUser()
    return user?.role === 'admin'
  }

  static async login(email: string, password: string) {
    try {
        console.log('🔐 Logging in user:', email);

        const response = await api.post('/auth/login', {
          email,
          password,
        });

        const authPayload = this.extractAuthPayload(response.data)
        return {
          ...response.data,
          ...authPayload,
          success: response.data?.success ?? true,

      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async loginUser(credentials: { email: string; password: string }) {
    return this.login(credentials.email, credentials.password)
  }

  static async logout() {
    try {
      console.log('🚪 Logging out user...')
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      localStorage.removeItem('adminToken')
      disconnectSocket()
      console.log('✅ User logged out successfully')
      return true
    } catch (error) {
      console.error('❌ Error during logout:', error)
      return false
    }
  }

  static async register(userDataOrName: any, email?: string, password?: string, role?: string) {
    const payload = typeof userDataOrName === 'object' && userDataOrName !== null
      ? userDataOrName
      : { name: userDataOrName, email, password, role: role || 'user' }
    try {
      console.log('📝 Registering user:', payload.email)
      const response = await api.post('/auth/register', payload)
      console.log('✅ Registration successful')
      return response.data
    } catch (error: any) {
      console.error('❌ Registration error:', error?.message || error)
      return { success: false, error: error.response?.data?.message || error.message || 'Registration failed' }
    }
  }

  static async sendLoginOTP(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('📧 Sending login OTP to:', email)
      const response = await api.post('/auth/send-login-otp', { email })
      console.log('✅ Login OTP sent successfully')
      return { success: true, message: response.data?.message }
    } catch (error: any) {
      console.error('❌ Error sending login OTP:', error?.message || error)
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to send login OTP' }
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<OTPResult> {
    try {
      console.log('🔐 Verifying OTP for:', email);

      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
      });

      const authPayload = this.extractAuthPayload(response.data)
      return {
        ...response.data,
        ...authPayload,
        success: response.data?.success ?? true,
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  static async refreshToken() {
    try {
      console.log('🔄 Refreshing token...')
      const response = await api.post('/auth/refresh')
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken
      if (!token) {
        throw new Error('No token in refresh response')
      }
      const user = this.getUser()
      this.storeToken(token, user)
      console.log('✅ Token refreshed successfully')
      if (typeof reconnectSocket === 'function') {
        reconnectSocket(token)
      } else {
        console.warn('❌ reconnectSocket is not available')
      }
      return { success: true, token }
    } catch (error: any) {
      console.error('❌ Token refresh error:', error?.message || error)
      this.logout()
      return { success: false, error: error.response?.data?.message || error.message || 'Token refresh failed' }
    }
  }

  static async getProfile(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('👤 Fetching user profile...')
      const response = await api.get('/auth/me')
      const data = response.data || {}
      const profileUser = this.normalizeUser(data.user || data)
      console.log('✅ Profile fetched successfully')
      return { success: true, user: profileUser }
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error?.message || error)
      if (error.response?.status === 401) {
        console.log('🔄 Token invalid, attempting refresh...')
        const refreshResult = await this.refreshToken()
        if (refreshResult.success) {
          return this.getProfile()
        }
        this.logout()
      }
      return { success: false, error: error.response?.data?.message || error.message || 'Profile fetch failed' }
    }
  }

  static async updateProfile(updates: any): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('📝 Updating profile...')
      const response = await api.put('/auth/profile', updates)
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      console.log('✅ Profile updated successfully')
      return { success: true, user: response.data.user }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error?.message || error)
      return { success: false, error: error.response?.data?.message || error.message || 'Profile update failed' }
    }
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🔐 Requesting password reset for:', email)
      const response = await api.post('/auth/forgot-password', { email })
      console.log('✅ Password reset requested')
      return { success: true, message: response.data?.message }
    } catch (error: any) {
      console.error('❌ Password reset request error:', error?.message || error)
      return { success: false, error: error.response?.data?.message || error.message || 'Password reset request failed' }
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🔐 Resetting password...')
      const response = await api.post('/auth/reset-password', { token, password: newPassword })
      console.log('✅ Password reset successfully')
      return { success: true, message: response.data?.message }
    } catch (error: any) {
      console.error('❌ Password reset error:', error?.message || error)
      return { success: false, error: error.response?.data?.message || error.message || 'Password reset failed' }
    }
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    try {
      console.log('🔐 Changing password...')
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      })

      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('❌ Error changing password:', error?.message || error)
      return { success: false, message: error?.response?.data?.message || 'Failed to change password' }
    }
  }

  static getAuthHeader() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  static clearAuthData() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      localStorage.removeItem('adminToken')
      disconnectSocket()
      console.log('✅ Auth data cleared')
    } catch (error) {
      console.error('❌ Error clearing auth data:', error)
    }
  }

  static async googleLogin(googleCredential: string) {
    try {
      console.log('🔐 Logging in with Google...')
      const response = await api.post('/auth/google', { credential: googleCredential })
      console.log('✅ Google login successful')
      const data = response.data || {}
      const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken
      const user = data.user || data.data?.user || data
      if (!token) {
        throw new Error('No token in response')
      }
      if (!user) {
        throw new Error('No user in response')
      }
      const normalizedUser = this.normalizeUser(user)
      this.storeToken(token, normalizedUser)
      console.log('🔌 Reconnecting socket with token...')
      const socket = reconnectSocket(token)
      if (socket) {
        console.log('✅ Socket reconnected:', socket.id)
      }
      return { success: true, token, user: normalizedUser }
    } catch (error: any) {
      console.error('❌ Google login error:', error?.message || error)
      return { success: false, error: error.response?.data?.message || error.message || 'Google login failed' }
    }
  }
}

export default AuthService
export const loginUser = AuthService.loginUser
