'use client';

import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Briefcase, Users, CheckCircle, ArrowRight, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-300 text-sm font-medium mb-6">
              ✨ Welcome to Airswift
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dream Job</span> Today
            </h1>

            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with top employers and discover amazing career opportunities. Join thousands of professionals finding their perfect fit on Airswift.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-slate-700/50 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-blue-400">5K+</div>
                <div className="text-slate-300 mt-2">Active Jobs</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-cyan-400">10K+</div>
                <div className="text-slate-300 mt-2">Job Seekers</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-purple-400">500+</div>
                <div className="text-slate-300 mt-2">Companies</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Why Choose Airswift?</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">Everything you need to land your dream job</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-700/50 transition-all duration-300 backdrop-blur-sm">
                <div className="bg-blue-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all">
                  <Briefcase className="text-blue-400" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Curated Opportunities</h3>
                <p className="text-slate-300">Access to thousands of hand-picked job listings from top companies worldwide</p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-700/50 transition-all duration-300 backdrop-blur-sm">
                <div className="bg-cyan-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-all">
                  <Users className="text-cyan-400" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Easy Application</h3>
                <p className="text-slate-300">Apply to your favorite jobs with just a few clicks. Track all your applications in one place</p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-700/50 transition-all duration-300 backdrop-blur-sm">
                <div className="bg-purple-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-all">
                  <CheckCircle className="text-purple-400" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Verified Employers</h3>
                <p className="text-slate-300">All employers on our platform are verified to ensure legitimate and quality opportunities</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-700">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-lg text-slate-300">Get your dream job in three simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Sign Up', desc: 'Create your account in less than 2 minutes' },
                { step: '02', title: 'Browse Jobs', desc: 'Explore thousands of job opportunities' },
                { step: '03', title: 'Apply & Get Hired', desc: 'Apply to jobs and land your dream role' },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="text-7xl font-bold text-slate-700/30 mb-2">{item.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                  <Star className="text-yellow-300" fill="currentColor" /> Ready to Start?
                </h2>
                <p className="text-xl text-blue-100 mb-8">Join millions of job seekers and find your perfect opportunity today</p>
                <Link
                  href="/register"
                  className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300 shadow-lg"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
