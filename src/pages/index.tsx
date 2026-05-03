import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Users, Zap, Shield, Award } from 'lucide-react'
import Button from '@/components/Button'

const features = [
  {
    title: 'Smart Job Matching',
    description: 'AI-powered matching to find roles perfect for your skills.',
    icon: Zap,
    color: 'bg-green-50',
    iconColor: 'text-primary',
  },
  {
    title: 'Secure & Verified',
    description: 'All employers verified and secured for your peace of mind.',
    icon: Shield,
    color: 'bg-blue-50',
    iconColor: 'text-secondary',
  },
  {
    title: 'Expert Support',
    description: 'Dedicated career advisors guide you every step of the way.',
    icon: Briefcase,
    color: 'bg-orange-50',
    iconColor: 'text-accent',
  },
]

const stats = [
  { number: '5K+', label: 'Active Opportunities' },
  { number: '10K+', label: 'Successful Hires' },
  { number: '95%', label: 'Success Rate' },
]

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Logo Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <img src="/logo.svg" alt="TALEX Logo" className="h-10 sm:h-12 w-auto" />
          <nav className="hidden sm:flex gap-6">
            <Link href="/login" className="text-sm font-medium text-primary hover:text-primary-dark">Login</Link>
            <Link href="/register" className="text-sm font-medium text-primary hover:text-primary-dark">Register</Link>
          </nav>
        </div>
      </header>
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-teal to-secondary text-white py-12 sm:py-20 lg:py-32">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur text-xs sm:text-sm">
                  <span className="relative flex h-1.5 sm:h-2 w-1.5 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 bg-white"></span>
                  </span>
                  <span className="font-semibold">Instant access to vetted roles</span>
                </div>

                {/* Heading and Description */}
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                    Where Talent Meets Opportunity
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
                    Discover verified job listings, connect with hiring teams, and grow your career with Talex.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      fullWidth
                      className="w-full sm:w-auto text-white border-white hover:bg-white/10 text-sm sm:text-base"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      fullWidth
                      className="w-full sm:w-auto text-white text-sm sm:text-base"
                    >
                      Register <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/15">
                  {stats.map((stat) => (
                    <div key={stat.label} className="min-w-0">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{stat.number}</div>
                      <div className="text-xs sm:text-sm text-white/70 mt-1 leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Featured Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative mt-8 sm:mt-0"
              >
                <div className="rounded-2xl sm:rounded-[2.5rem] bg-white/10 p-4 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-lg">
                  {/* Featured Role Card */}
                  <div className="rounded-xl sm:rounded-[2rem] bg-slate-950/90 p-4 sm:p-8 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">Featured role</p>
                        <h2 className="text-lg sm:text-2xl font-semibold text-white mt-1 sm:mt-2">Senior Product Manager</h2>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-200 w-fit">
                        Hired
                      </span>
                    </div>
                    
                    {/* Role Details */}
                    <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400">Location</p>
                        <p className="font-medium">Remote · Global</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400">Compensation</p>
                        <p className="font-medium">$120k - $150k</p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Message */}
                  <div className="mt-4 sm:mt-8 rounded-xl sm:rounded-[2rem] bg-white/10 p-4 sm:p-6 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 mb-2 sm:mb-3">Trusted by top talent</p>
                    <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                      Talex empowers professionals with smart recommendations, secure applications, and direct access to employers.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-20 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Talex?</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
                We make hiring simple, secure, and built around the talent you want.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 ${feature.color} border border-gray-200 hover:shadow-lg transition-shadow`}
                  >
                    <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className={`h-5 sm:h-7 w-5 sm:w-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-20 lg:py-32 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight px-2">
              Ready to launch your next career move?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 px-2 max-w-3xl mx-auto">
              Join thousands of professionals who trust Talex to connect them with top employers and high-growth opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
              <Link href="/login" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  fullWidth
                  className="w-full sm:w-auto text-white border-white hover:bg-white/10 text-sm sm:text-base"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  fullWidth
                  className="w-full sm:w-auto text-gray-900 text-sm sm:text-base"
                >
                  Register Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
