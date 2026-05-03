import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Building, Search, MapPin, Briefcase, Shield, Globe, Users, Star, ChevronRight } from 'lucide-react'
import Button from '@/components/Button'

const featuredJobs = [
  {
    company: 'RemoteHub',
    role: 'Senior Product Manager',
    location: 'Remote',
    salary: '$120k - $160k',
    time: '1h ago',
  },
  {
    company: 'TechFlow',
    role: 'Frontend Developer',
    location: 'Toronto, Canada',
    salary: '$80k - $110k',
    time: '3h ago',
  },
  {
    company: 'CloudScale',
    role: 'DevOps Engineer',
    location: 'Remote',
    salary: '$100k - $140k',
    time: '5h ago',
  },
  {
    company: 'DesignHub',
    role: 'UI/UX Designer',
    location: 'San Francisco, CA',
    salary: '$70k - $100k',
    time: '6h ago',
  },
]

const brandLogos = ['Google', 'Microsoft', 'Amazon', 'Spotify', 'Airbnb', 'Dropbox']

const highlights = [
  {
    icon: Shield,
    title: 'Verified Employers',
    description: 'All companies are verified to ensure genuine opportunities.',
  },
  {
    icon: Globe,
    title: 'Smart Matching',
    description: 'AI matches you with jobs that fit your skills and goals.',
  },
  {
    icon: Building,
    title: 'Global Opportunities',
    description: 'Discover remote and on-site jobs from top companies worldwide.',
  },
]

const metrics = [
  { value: '10,000+', label: 'Active Job Seekers' },
  { value: '2,500+', label: 'Verified Companies' },
  { value: '15,000+', label: 'Successful Hires' },
  { value: '95%', label: 'Satisfaction Rate' },
]

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
          <div className="flex h-[70px] items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">AIRSWIFT</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link href="#" className="text-blue-600">Home</Link>
              <Link href="#jobs" className="hover:text-blue-600">Jobs</Link>
              <Link href="#companies" className="hover:text-blue-600">Companies</Link>
              <div className="relative group">
                <button className="hover:text-blue-600">Resources</button>
                <div className="invisible absolute left-0 top-full mt-3 hidden min-w-[160px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl group-hover:visible group-hover:block">
                  <Link href="#" className="block rounded-xl px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Blog</Link>
                  <Link href="#" className="block rounded-xl px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Guides</Link>
                  <Link href="#" className="block rounded-xl px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Help Center</Link>
                </div>
              </div>
              <Link href="#pricing" className="hover:text-blue-600">Pricing</Link>
            </nav>
            <div className="flex items-center gap-3">
              <button className="text-sm font-medium text-slate-700 hover:text-blue-600">Login</button>
              <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">Register</Button>
            </div>
          </div>
        </header>

        <main className="space-y-16 py-16">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="grid gap-10 grid-cols-1 lg:grid-cols-2 lg:items-center"
          >
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
                Trusted by 10,000+ job seekers and employers
              </div>
              <div className="space-y-5">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  Find Verified Jobs.
                  <br />
                  Get Hired Faster.
                </h1>
                <p className="max-w-2xl text-base text-slate-600 sm:text-lg md:text-xl">
                  AIRSWIFT connects talented people with top companies across the globe. Your next opportunity is here.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                  Find Jobs
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Create Profile
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.18 }}
                className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl"
              >
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] items-center">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Search className="h-5 w-5 text-slate-500" />
                    <input type="text" placeholder="Job title or keyword" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <MapPin className="h-5 w-5 text-slate-500" />
                    <select className="w-full bg-transparent text-sm text-slate-900 outline-none">
                      <option>Anywhere</option>
                      <option>New York</option>
                      <option>Toronto</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Briefcase className="h-5 w-5 text-slate-500" />
                    <select className="w-full bg-transparent text-sm text-slate-900 outline-none">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <Button variant="primary" size="md" className="w-full bg-blue-600 hover:bg-blue-700">
                    Search
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                  {['Remote', 'Software Engineer', 'Marketing', 'Design', 'Data Analyst'].map((search) => (
                    <button key={search} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                      {search}
                    </button>
                  ))}
                </div>
            </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.2 }}
              className="relative w-full"
            >
              <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-blue-100 opacity-70 blur-3xl"></div>
              <div className="absolute -right-10 bottom-10 h-24 w-24 rounded-full bg-cyan-100 opacity-70 blur-3xl"></div>
              <div className="relative overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl border border-slate-200 sm:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-3xl bg-blue-600/10" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Avery Lee</p>
                        <p className="text-xs text-slate-500">Software Recruiter</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Top recruiter</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="h-12 w-12 rounded-3xl bg-blue-500/20" />
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">98%</span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-900">Job Match</p>
                      <p className="mt-2 text-sm text-slate-500">Highly accurate role matches.</p>
                    </div>
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="h-12 w-12 rounded-3xl bg-slate-900/10" />
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">Live</span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-900">Live roles</p>
                      <p className="mt-2 text-sm text-slate-500">Updated in real time.</p>
                    </div>
                  </div>

                  <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Your next team</p>
                        <p className="mt-2 text-lg font-semibold">Meet the hiring squad</p>
                      </div>
                      <div className="h-12 w-12 rounded-3xl bg-blue-600/20" />
                    </div>
                    <div className="mt-5 rounded-[28px] bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-sm text-white">
                      Dashboard preview
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            </motion.section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Featured Jobs</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">Featured Jobs</h2>
                </div>
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featuredJobs.map((job) => (
                <article key={job.role} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-800">{job.company.charAt(0)}</div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Featured</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">{job.role}</h3>
                  <p className="mt-3 text-sm text-slate-600">{job.location}</p>
                  <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>{job.salary}</span>
                    <span className="text-slate-500">{job.time}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </section>

          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-4xl font-bold text-blue-600">{metric.value}</p>
                <p className="mt-3 text-sm text-slate-600">{metric.label}</p>
              </div>
            ))}
          </section>

          <section className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">What Our Users Say</p>
                <h2 className="mt-4 text-3xl font-bold text-slate-900">What Our Users Say</h2>
                <p className="mt-4 max-w-xl text-slate-600">AIRSWIFT helped me find a remote job that perfectly matches my skills. The process was so smooth and professional.</p>
              </div>
              <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl">
                <Star className="h-6 w-6 text-blue-400" />
                <p className="mt-6 text-lg leading-8">“AIRS WIFT helped me find a remote role in less than two weeks. The matching quality was outstanding.”</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold">SJ</div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-slate-300">Product Designer</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] bg-gradient-to-r from-blue-600 to-sky-500 px-8 py-14 text-white shadow-2xl">
            <div className="grid gap-6 md:grid-cols-[1.5fr_0.8fr] md:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Ready to launch your next career move?</p>
                <h2 className="mt-4 text-3xl font-bold">Join AIRSWIFT today and explore thousands of verified job opportunities.</h2>
              </div>
              <div className="flex items-center justify-start md:justify-end">
                <Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-slate-100">
                  Get Started Free
                </Button>
              </div>
            </div>
          </section>

          <footer className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">AIRSWIFT</p>
                  </div>
                </div>
                <p className="mt-6 max-w-sm text-sm text-slate-600">Connecting talent with verified opportunities across the globe. Fast, modern hiring for job seekers and employers.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">For Job Seekers</h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li><Link href="#" className="hover:text-blue-600">Job Search</Link></li>
                  <li><Link href="#" className="hover:text-blue-600">Create Profile</Link></li>
                  <li><Link href="#" className="hover:text-blue-600">Career Advice</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">For Employers</h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li><Link href="#" className="hover:text-blue-600">Hire Talent</Link></li>
                  <li><Link href="#" className="hover:text-blue-600">Employer Resources</Link></li>
                  <li><Link href="#" className="hover:text-blue-600">Post a Job</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Support</h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li><Link href="#" className="hover:text-blue-600">Contact</Link></li>
                  <li><Link href="#" className="hover:text-blue-600">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-blue-600">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 AIRSWIFT. All rights reserved.</p>
              <div className="flex items-center gap-4 text-slate-600">
                <span className="hover:text-blue-600 cursor-pointer">Twitter</span>
                <span className="hover:text-blue-600 cursor-pointer">LinkedIn</span>
                <span className="hover:text-blue-600 cursor-pointer">Facebook</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
