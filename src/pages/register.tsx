import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import API from "@/services/apiClient";
import { clearAuth } from '@/lib/auth';
import { validateEmailForAuth } from '@/utils/roleUtils';
import { CheckCircle, AlertCircle, InfoIcon, Eye, EyeOff, Check, X } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'form' | 'success'>('form');
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  // Password strength validation
  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: "", color: "bg-gray-200" };
    
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
      { score: 0, label: "", color: "bg-gray-200" },
      { score: 1, label: "Weak", color: "bg-red-500" },
      { score: 2, label: "Fair", color: "bg-yellow-500" },
      { score: 3, label: "Good", color: "bg-blue-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
      { score: 5, label: "Very Strong", color: "bg-green-600" },
    ];

    return levels[Math.min(score, 5)];
  }, [formData.password]);

  // Email validation
  const isValidEmail = formData.email ? /^[^\s@]+@gmail\.com$/.test(formData.email.toLowerCase()) : false;
  const isValidName = formData.name.trim().length >= 2;
  const isValidPassword = formData.password.length >= 6;
  const isFormValid = isValidName && isValidEmail && isValidPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!isFormValid) {
      setError("Please fill in all fields correctly");
      return;
    }

    setLoading(true);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Enhanced decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Brand Logo */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <span className="text-2xl font-bold text-white">✦</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                Create Account
              </h1>
              <p className="text-base text-gray-600">
                Join Airswift and unlock amazing career opportunities
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex gap-3 items-start">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Registration Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Full Name
                  </label>
                  {touched.name && isValidName && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <Check size={14} /> Valid
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white ${
                    touched.name && formData.name && !isValidName
                      ? "border-red-300 focus:ring-red-500"
                      : touched.name && isValidName
                      ? "border-green-300 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  disabled={loading}
                  required
                />
                {touched.name && formData.name && !isValidName && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <X size={14} /> Name must be at least 2 characters
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address
                  </label>
                  {touched.email && isValidEmail && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <Check size={14} /> Valid
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white ${
                    touched.email && formData.email && !isValidEmail
                      ? "border-red-300 focus:ring-red-500"
                      : touched.email && isValidEmail
                      ? "border-green-300 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📧 Gmail only • Verification link will be sent to this email
                </p>
                {touched.email && formData.email && !isValidEmail && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X size={14} /> Please enter a valid Gmail address
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password
                  </label>
                  {touched.password && isValidPassword && (
                    <span className={`text-xs font-medium flex items-center gap-1 ${
                      passwordStrength.score >= 4 ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white pr-12 ${
                      touched.password && formData.password && !isValidPassword
                        ? "border-red-300 focus:ring-red-500"
                        : touched.password && isValidPassword
                        ? "border-green-300 focus:ring-green-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    disabled={loading}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {touched.password && formData.password && (
                  <div className="mt-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            bar <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  • Minimum 6 characters • Use uppercase, numbers & symbols for stronger password
                </p>
              </div>

              {/* Terms & Privacy */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-xl p-4">
                <p className="text-xs text-gray-700 leading-relaxed">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                  isFormValid && !loading
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <Link href="/login">
              <button className="w-full py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                Sign In to Existing Account
              </button>
            </Link>

            {/* Security Note */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <span>🔒</span>
                <span>Your password is securely encrypted. We never share your data.</span>
              </p>
            </div>
          </div>

          {/* Support Link */}
          <p className="text-center text-gray-300 text-xs mt-6">
            Need help?{" "}
            <Link href="/contact" className="text-blue-300 hover:text-blue-200 font-medium transition">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    );
  }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Enhanced decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Success Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 text-center border border-white/20">
          
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-full p-4 border border-green-200">
                <CheckCircle size={56} className="text-green-600 drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Account Created!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You're one step away from getting started
          </p>

          {/* Email Display */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-xl p-5 mb-8">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">Confirmation sent to</p>
            <p className="font-mono text-blue-900 font-bold text-lg break-all">{registeredEmail}</p>
          </div>

          {/* Instructions */}
          <div className="bg-green-50/80 border border-green-200/50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-sm">
              <InfoIcon size={18} className="flex-shrink-0" />
              Next Steps:
            </h3>
            <ol className="space-y-3 text-sm text-green-800">
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Check your email inbox for the verification link from Airswift</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Click the verification link to confirm your email address</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>Return here and log in with your credentials</span>
              </li>
            </ol>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50/80 border border-amber-200/50 rounded-xl p-5 mb-8">
            <p className="text-sm font-semibold text-amber-900 mb-2">⏰ Important</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              The verification link expires in <span className="font-bold">24 hours</span>. If you don't see the email, check your spam folder.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => router.push('/verify-email')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              Resend Verification Link
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Go to Login
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>

          {/* Support Link */}
          <p className="text-sm text-gray-600">
            Having trouble?{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
              Contact our support team
            </Link>
          </p>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-300 text-xs mt-6">
          ✓ Secure • Professional • Fast
        </p>
      </div>
    </div>
  );
}
