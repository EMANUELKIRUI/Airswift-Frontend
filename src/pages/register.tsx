import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import API from "@/services/apiClient";
import { clearAuth } from '@/lib/auth';
import { validateEmailForAuth } from '@/utils/roleUtils';
import { CheckCircle, AlertCircle, InfoIcon } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'form' | 'success'>('form');
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Email validation
    const emailValidation = validateEmailForAuth(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      setLoading(false);
      return;
    }

    try {
      clearAuth();

      // Send registration request
      const result = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user'
      });

      console.log("Registration response:", result.data);

      // Handle the response
      if (result.data.code === 'REGISTRATION_SUCCESS') {
        // New user created - show verification email screen
        setRegisteredEmail(formData.email);
        setRegistrationStatus('success');
        setFormData({ name: "", email: "", password: "" });
      } else if (result.data.code === 'VERIFICATION_EMAIL_RESENT') {
        // Unverified user tried to register again - show verification email screen
        setRegisteredEmail(formData.email);
        setRegistrationStatus('success');
        setFormData({ name: "", email: "", password: "" });
      } else {
        // Unexpected response
        setError(result.data.message || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Handle specific error codes
      if (err.response?.data?.code === 'USER_EXISTS') {
        setError("An account with this email already exists. Please log in.");
      } else if (err.response?.data?.code === 'RATE_LIMIT_EXCEEDED') {
        setError(err.response.data.message || "Too many registration attempts. Please try again later.");
      } else if (err.response?.data?.code === 'EMAIL_SEND_FAILED') {
        setError("Failed to send verification email. Please try again.");
      } else {
        setError(err.response?.data?.message || err?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Registration form view
  if (registrationStatus === 'form') {
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

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Join our platform to find amazing opportunities
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex gap-3">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address 
                  <span className="text-blue-600 font-normal text-xs ml-1">(Gmail only)</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-gap-1">
                  ✉️ Use your @gmail.com account • We'll send you a verification link
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 6 characters recommended
                </p>
              </div>

              {/* Terms Agreement */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-gray-700">
                <p>
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-700 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                Sign in
              </Link>
            </p>

            {/* Security Note */}
            <div className="text-xs text-gray-500 text-center mt-6 pt-6 border-t border-gray-200">
              <p>
                🔒 Your password is securely encrypted. We never share your data.
              </p>
            </div>
          </div>

          {/* Support Text */}
          <p className="text-center text-gray-600 text-xs mt-4 md:mt-6">
            Need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Success screen - prompt to verify email
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 sm:px-6 md:px-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 text-center">
          
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative bg-green-100 rounded-full p-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Header */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Account Created!
          </h1>
          <p className="text-gray-600 text-base mb-6">
            We've sent a verification link to your email
          </p>

          {/* Email Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-mono text-blue-900 font-semibold">{registeredEmail}</p>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <InfoIcon size={18} />
              Next Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-green-800">
              <li>Check your email inbox for the verification link</li>
              <li>Click the link to verify your email address</li>
              <li>Return here and log in with your credentials</li>
            </ol>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-900">
              <strong>⏰ Link expires in 24 hours</strong><br/>
              <br/>
              Don't see the email? Check your spam folder or{" "}
              <Link href="/verify-email" className="text-blue-600 hover:text-blue-700 font-semibold">
                request a new verification link
              </Link>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/verify-email')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg"
            >
              Resend Verification Link
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Go to Login
            </button>
          </div>

          {/* Support Link */}
          <p className="text-xs text-gray-500 mt-6 pt-6 border-t border-gray-200">
            Having issues?{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
