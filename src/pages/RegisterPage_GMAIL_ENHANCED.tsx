import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import API from "@/services/apiClient";
import { clearAuth } from '@/lib/auth';

/**
 * RegisterPage_ENHANCED - Gmail-Only Registration
 * 
 * Features:
 * ✅ Real-time Gmail validation
 * ✅ Clear error messages with Gmail requirement
 * ✅ Password strength indicator
 * ✅ Enhanced error handling
 * ✅ Verification email flow
 * ✅ Better UX/UI feedback
 */

interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
}

export default function RegisterEnhanced() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'form' | 'success'>('form');
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  /**
   * ✅ ENHANCED: Gmail-only validation with real-time feedback
   */
  const isGmailEmail = (email: string) => {
    return /^[^\s@]+@gmail\.com$/.test(email.toLowerCase());
  };

  const emailValidationStatus = useMemo(() => {
    const email = formData.email.trim();
    
    if (!email) {
      return { isValid: false, message: '', status: 'empty' };
    }
    
    if (!email.includes('@')) {
      return { isValid: false, message: 'Email must include @', status: 'invalid' };
    }
    
    if (!isGmailEmail(email)) {
      const domain = email.substring(email.indexOf('@') + 1);
      return {
        isValid: false,
        message: `Only @gmail.com emails allowed (you entered @${domain})`,
        status: 'non-gmail'
      };
    }
    
    return {
      isValid: true,
      message: 'Gmail email verified ✓',
      status: 'valid'
    };
  }, [formData.email]);

  /**
   * ✅ ENHANCED: Password strength calculator
   */
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    
    if (!pwd) {
      return { score: 0, label: 'No password', color: 'bg-gray-300' } as PasswordStrength;
    }
    
    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    
    // Complexity check
    if (/[A-Z]/.test(pwd)) score++; // Has uppercase
    if (/[0-9]/.test(pwd)) score++; // Has numbers
    if (/[!@#$%^&*]/.test(pwd)) score++; // Has special chars
    
    score = Math.min(Math.ceil(score / 2), 3) as 0 | 1 | 2 | 3;
    
    const strengthMap: Record<number, PasswordStrength> = {
      0: { score: 0, label: 'Weak', color: 'bg-red-500' },
      1: { score: 1, label: 'Fair', color: 'bg-yellow-500' },
      2: { score: 2, label: 'Good', color: 'bg-blue-500' },
      3: { score: 3, label: 'Strong', color: 'bg-green-500' }
    };
    
    return strengthMap[score];
  }, [formData.password]);

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ ENHANCED: Comprehensive validation
      
      // 1. Basic validation
      if (!formData.name.trim()) {
        setError("Please enter your full name");
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      // 2. Gmail validation - CRITICAL
      if (!isGmailEmail(formData.email)) {
        setError(emailValidationStatus.message || "Only @gmail.com emails are allowed");
        setLoading(false);
        return;
      }

      // 3. Password validation
      if (!formData.password) {
        setError("Please enter a password");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // 4. Clear previous auth
      clearAuth();

      console.log("📝 Submitting registration with Gmail email:", formData.email);

      // 5. Submit registration
      const result = await API.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: 'user'
      });

      console.log("✅ Registration response:", result.data);

      // 6. Handle response
      if (result.data.code === 'REGISTRATION_SUCCESS' || result.data.code === 'VERIFICATION_EMAIL_RESENT') {
        setRegisteredEmail(formData.email);
        setRegistrationStatus('success');
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        setError(result.data.message || "Registration failed. Please try again.");
      }

    } catch (err: any) {
      console.error("❌ Registration error:", err);
      
      // ✅ ENHANCED: Better error messages
      const errorData = err.response?.data;
      const status = err.response?.status;

      if (status === 400) {
        if (errorData?.code === 'EMAIL_NOT_GMAIL') {
          setError("Only @gmail.com emails are allowed for registration");
        } else if (errorData?.message?.includes('gmail')) {
          setError("Only @gmail.com emails are allowed");
        } else {
          setError(errorData?.message || "Invalid registration data. Please check your input.");
        }
      } else if (status === 409 || errorData?.code === 'USER_EXISTS') {
        setError("An account with this email already exists. Please log in or use a different email.");
      } else if (status === 429 || errorData?.code === 'RATE_LIMIT_EXCEEDED') {
        setError("Too many registration attempts. Please try again in a few minutes.");
      } else if (status === 500 || errorData?.code === 'EMAIL_SEND_FAILED') {
        setError("Server error or email service issue. Please try again later.");
      } else {
        setError(errorData?.message || err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============ Registration Form View ============
  if (registrationStatus === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Airswift
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Join our platform using your Gmail account
          </p>

          {/* ✅ ENHANCED: Error display */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Your full name as it appears in official documents</p>
            </div>

            {/* ✅ ENHANCED: Email field with Gmail validation feedback */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Email Address
                <span className="text-red-500 ml-1">*</span>
                <span className="text-xs font-normal text-blue-600 ml-2">(Gmail only)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition ${
                    emailFocused || formData.email
                      ? emailValidationStatus.isValid
                        ? 'border-green-500 focus:ring-2 focus:ring-green-200'
                        : 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
                  }`}
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  disabled={loading}
                  required
                />
                {/* Status indicator */}
                {formData.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailValidationStatus.isValid ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl">❌</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* ✅ ENHANCED: Email validation feedback */}
              {formData.email && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${
                  emailValidationStatus.isValid
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {emailValidationStatus.isValid ? '✓' : '✗'} {emailValidationStatus.message}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Only @gmail.com accounts are allowed. We'll send you a verification link.
              </p>
            </div>

            {/* ✅ ENHANCED: Password with strength indicator */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                disabled={loading}
                required
                minLength={6}
              />
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all`}
                        style={{ width: `${(passwordStrength.score + 1) * 25}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.score === 0 ? 'text-red-600' :
                      passwordStrength.score === 1 ? 'text-yellow-600' :
                      passwordStrength.score === 2 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li className={formData.password.length >= 6 ? '✓ text-green-700' : '✗ text-gray-400'}>
                      At least 6 characters
                    </li>
                    <li className={formData.password.length >= 12 ? '✓ text-green-700' : '✗ text-gray-400'}>
                      12+ characters (recommended)
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? '✓ text-green-700' : '✗ text-gray-400'}>
                      Uppercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? '✓ text-green-700' : '✗ text-gray-400'}>
                      Number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* ✅ ENHANCED: Confirm password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition ${
                    formData.confirmPassword
                      ? passwordsMatch
                        ? 'border-green-500 focus:ring-2 focus:ring-green-200'
                        : 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  required
                />
                {formData.confirmPassword && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {passwordsMatch ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl">❌</span>
                    )}
                  </div>
                )}
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-700 mt-2">✗ Passwords do not match</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700">
              <p className="m-0">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline font-semibold">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* ✅ ENHANCED: Submit button with validation state */}
            <Button
              type="submit"
              disabled={loading || !emailValidationStatus.isValid || !passwordsMatch || !formData.name}
              className={`w-full py-2.5 rounded-lg transition font-semibold text-white ${
                loading || !emailValidationStatus.isValid || !passwordsMatch || !formData.name
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⏳</span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Sign in here
            </Link>
          </p>

          {/* Security Note */}
          <div className="text-xs text-gray-500 text-center mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
            <span>🔒</span>
            <p>Your password is encrypted and never shared</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ Success/Verification View ============
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="text-6xl mb-6 animate-bounce">✅</div>

        <h1 className="text-2xl font-bold mb-2">Account Created!</h1>
        <p className="text-gray-600 mb-6 text-sm">
          We've sent a verification link to your Gmail inbox
        </p>

        {/* Email Display */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
          <p className="font-mono text-green-900 font-semibold text-lg">{registeredEmail}</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span>📋</span> Next Steps:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Check your Gmail inbox for verification email</li>
            <li>Click the verification link in the email</li>
            <li>Return to login with your credentials</li>
          </ol>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 text-left">
            <strong className="flex items-center gap-2 mb-2">
              <span>⏰</span>
              Link expires in 24 hours
            </strong>
            <span className="block text-xs">
              Don't see the email? Check your spam/promotions folder or{" "}
              <Link href="/verify-email" className="text-blue-600 hover:underline font-medium">
                request a new link
              </Link>
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/verify-email')}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Resend Verification Link
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Go to Login
          </button>
        </div>

        {/* Support Link */}
        <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
          Having issues?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline font-medium">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
