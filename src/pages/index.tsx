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
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),_transparent_28%)] pointer-events-none"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
            <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-cyan-300 font-medium shadow-sm">
                  Trusted by modern talent teams
                </span>

                <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white">
                  A smarter way to discover jobs, apply faster, and build your career.
                </h1>

                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Airswift brings together job seekers and verified employers with a polished experience built for productivity, clarity, and confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-8 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
                  >
                    Sign in
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
                    <p className="text-3xl font-semibold text-cyan-400">5K+</p>
                    <p className="mt-2 text-sm text-slate-400">active jobs across industries</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
                    <p className="text-3xl font-semibold text-blue-400">10K+</p>
                    <p className="mt-2 text-sm text-slate-400">job seekers already onboard</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
                    <p className="text-3xl font-semibold text-violet-400">500+</p>
                    <p className="mt-2 text-sm text-slate-400">verified employer partners</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
                <div className="space-y-6">
                  <div className="rounded-3xl bg-slate-950/70 p-6 border border-slate-800">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Latest hiring update</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white">Technology roles rising 35% this month</h2>
                      </div>
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                        <Briefcase size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/70 p-6 border border-slate-800">
                      <p className="text-sm text-slate-400">Verified employers</p>
                      <p className="mt-3 text-xl font-semibold text-white">Reliable postings</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/70 p-6 border border-slate-800">
                      <p className="text-sm text-slate-400">Fast application flow</p>
                      <p className="mt-3 text-xl font-semibold text-white">Apply in seconds</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-950/70 p-6 border border-slate-800">
                    <p className="text-sm text-slate-400">Airswift highlights</p>
                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
                        Personalized job recommendations
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-3 w-3 rounded-full bg-blue-400"></span>
                        Clean dashboard for job tracking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-800 py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-12 xl:grid-cols-[0.95fr_0.9fr] items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Why Airswift</p>
                <h2 className="mt-4 text-4xl font-semibold text-white">A clear and confident hiring experience.</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  From search to application, Airswift makes every step feel modern, polished, and simple. Our platform is built for job seekers who want to move quickly and hire teams who expect quality talent.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/80 p-8 border border-slate-800 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Smarter matches</h3>
                  <p className="mt-3 text-slate-400">Personalized job recommendations for a faster search.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-8 border border-slate-800 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Verified opportunities</h3>
                  <p className="mt-3 text-slate-400">Each employer is vetted for reliable hiring prospects.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950/90 py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">How it works</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Get started in three simple steps.</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { label: '01', title: 'Create profile', desc: 'Complete your profile in minutes and highlight your strengths.' },
                { label: '02', title: 'Discover roles', desc: 'Use curated filters to find jobs that fit your goals.' },
                { label: '03', title: 'Apply quickly', desc: 'Send strong applications and manage everything in one place.' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-left shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-lg font-semibold text-cyan-300">
                    {item.label}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-r from-cyan-600 to-blue-600 p-[2px] shadow-2xl shadow-slate-950/30">
            <div className="rounded-[1.75rem] bg-slate-950 p-10 text-center">
              <h2 className="text-4xl font-semibold text-white">Ready to level up your job search?</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">Create your Airswift account today and start applying with confidence.</p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:scale-[1.02]">
                  Create free account
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 px-8 py-4 text-base font-semibold text-white transition hover:bg-slate-800">
                  Explore login
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
