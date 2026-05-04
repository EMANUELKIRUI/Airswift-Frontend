"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { clearAuth } from "@/lib/auth";
import { validateEmailForAuth } from "@/utils/roleUtils";
import { Eye, EyeOff } from "lucide-react";
import AuthService from "@/services/authService";
import API from "@/services/apiClient";
import OTPInput from "@/components/OTPInput";
import { redirectAfterLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResendPrompt, setShowResendPrompt] = useState(false);

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string>("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const emailValidation = validateEmailForAuth(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "");
        return;
      }

      clearAuth();

      const result = await AuthService.login(email, password);

      if (result.success) {
        const normalizedUser = AuthService.normalizeUser(result.user);
        console.log('✅ Login successful, redirecting...', normalizedUser);

        await login({ token: result.token, user: normalizedUser });
        await new Promise((resolve) => setTimeout(resolve, 0));
        await redirectAfterLogin(normalizedUser, router);
      } else {
        // ⚠️ Check if account is not verified
        const isNotVerified = result.error?.toLowerCase?.().includes('not verified') || 
                             result.error?.toLowerCase?.().includes('verification');
        
        if (isNotVerified) {
          setError(result.error || "Your Airswift account is pending activation. Check your inbox for the activation email.");
          setShowResendPrompt(true);
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err: any) {
      if (err.response?.data?.code === 'ACCOUNT_NOT_VERIFIED') {
        setError(
          err.response?.data?.message ||
          "Your Airswift account is pending activation. Check your inbox for the activation email."
        );
        setShowResendPrompt(true);
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError("");
    setGoogleLoading(true);

    try {
      clearAuth();
      await signIn('google', { callbackUrl: `${window.location.origin}/dashboard` });
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      setGoogleError(error?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const sendOtp = async () => {
    setOtpError("");
    setError("");
    setOtpStatus("");
    setSendingOtp(true);

    const emailTarget = otpEmail || email;
    const emailValidation = validateEmailForAuth(emailTarget);
    if (!emailValidation.isValid) {
      setOtpError(emailValidation.error || "");
      setSendingOtp(false);
      return;
    }

    try {
      await AuthService.sendLoginOTP(emailTarget);
      setOtpSent(true);
      setOtpStatus('A one-time verification code has been sent to your email.');
      setOtpEmail(emailTarget);
    } catch (err: any) {
      console.error('❌ Send OTP error:', err);
      setOtpError(err.response?.data?.message || err.message || 'Failed to send OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError("");
    setError("");
    setVerifyingOtp(true);

    const emailTarget = otpEmail || email;
    const emailValidation = validateEmailForAuth(emailTarget);
    if (!emailValidation.isValid) {
      setOtpError(emailValidation.error);
      setVerifyingOtp(false);
      return;
    }

    if (!otpCode) {
      setOtpError('Please enter the 6-digit OTP code.');
      setVerifyingOtp(false);
      return;
    }

    try {
      const result = await AuthService.verifyOTP(emailTarget, otpCode);
      if (result.token && result.user) {
        const normalizedUser = AuthService.normalizeUser(result.user);
        await login({ token: result.token, user: normalizedUser });
        await redirectAfterLogin(normalizedUser, router);
      } else {
        setOtpError('OTP verification failed');
      }
    } catch (err: any) {
      console.error('❌ OTP verification error:', err);
      setOtpError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  useEffect(() => {
    if (user && router.pathname === '/login') {
      redirectAfterLogin(user, router);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 sm:px-6 md:px-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Airswift Logo/Brand */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2">
                <div style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.5px"
                }}>
                  Airswift
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Sign in to access your opportunities
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
              {showResendPrompt && email && (
                <div className="rounded-xl bg-white border border-blue-100 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900 mb-2">Need a new activation link?</p>
                  <button
                    type="button"
                    onClick={() => router.push(`/verify-email?email=${encodeURIComponent(email)}`)}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Resend Airswift activation email
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input with visibility toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-gray-900">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Google Login */}
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width={100}
            />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-700 text-sm mt-6">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition">
              Create one
            </a>
          </p>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center mt-6 pt-6 border-t border-gray-200">
            <p>🔒 Your data is securely encrypted and protected</p>
          </div>
        </div>

        {/* Support Text - Mobile visible */}
        <p className="text-center text-gray-600 text-xs mt-4 md:mt-6">
          Need help?{" "}
          <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
