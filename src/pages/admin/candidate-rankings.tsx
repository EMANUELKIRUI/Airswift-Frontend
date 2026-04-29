'use client'

import React, { useEffect, useState } from 'react'
import { applicationService } from '@/services/applicationService'
import TopCandidates from '@/components/TopCandidates'
import { IApplication } from '@/lib/models/Application'

interface RankingStats {
  totalApplications: number
  averageScore: number
  mediusScore: number
  topScore: number
  lowestScore: number
  excellentCount: number
  goodCount: number
  moderateCount: number
  poorCount: number
}

export default function CandidateRankingPage() {
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch jobs and rankings
        const jobsData = await applicationService.getAvailableJobs()
        setJobs(jobsData)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateStats = async () => {
    try {
      const rankings = await applicationService.getCandidateRankings({
        jobId: selectedJob || undefined,
      })

      if (rankings && Array.isArray(rankings) && rankings.length > 0) {
        const total = rankings.length
        const scores = rankings.map((r: any) => r.aiScore?.total || 0)
        const avg = scores.reduce((a: number, b: number) => a + b, 0) / total

        setStats({
          totalApplications: total,
          averageScore: avg,
          mediusScore: scores.sort()[Math.floor(total / 2)],
          topScore: Math.max(...scores),
          lowestScore: Math.min(...scores),
          excellentCount: scores.filter((s: number) => s >= 85).length,
          goodCount: scores.filter((s: number) => s >= 70 && s < 85).length,
          moderateCount: scores.filter((s: number) => s >= 55 && s < 70).length,
          poorCount: scores.filter((s: number) => s < 55).length,
        })
      }
    } catch (err) {
      console.error('Error calculating stats:', err)
    }
  }

  useEffect(() => {
    calculateStats()
  }, [selectedJob])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Candidate Rankings</h1>
          <p className="text-gray-600 mt-2">
            AI-powered ranking and assessment of all candidates
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Total Applications"
              value={stats.totalApplications}
              color="blue"
            />
            <StatCard
              title="Average Score"
              value={stats.averageScore.toFixed(1)}
              color="purple"
            />
            <StatCard
              title="Median Score"
              value={stats.mediusScore.toFixed(1)}
              color="green"
            />
            <StatCard
              title="Top Score"
              value={stats.topScore.toFixed(1)}
              color="yellow"
            />
            <StatCard
              title="Lowest Score"
              value={stats.lowestScore.toFixed(1)}
              color="red"
            />
          </div>
        )}

        {/* Quality Distribution */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Excellent (85+)', count: stats.excellentCount, color: 'green' },
              { label: 'Good (70-84)', count: stats.goodCount, color: 'blue' },
              { label: 'Moderate (55-69)', count: stats.moderateCount, color: 'yellow' },
              { label: 'Poor (<55)', count: stats.poorCount, color: 'red' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className={`text-2xl font-bold mt-2 text-${item.color}-600`}>
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Position
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Jobs</option>
                {jobs.map((job: any) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Top
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Candidates Table */}
        <TopCandidates jobId={selectedJob} limit={limit} />

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How Scoring Works</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              <strong>Skills Score (0-100):</strong> Evaluated based on technical skills
              listed in CV matching job requirements
            </li>
            <li>
              <strong>Experience Score (0-100):</strong> Based on years of experience
              and relevance to the position
            </li>
            <li>
              <strong>Communication Score (0-100):</strong> Assessed from cover letter
              and CV writing quality
            </li>
            <li>
              <strong>Overall Score:</strong> Weighted average of all three categories
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: string | number
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900',
    purple: 'bg-purple-50 text-purple-900',
    green: 'bg-green-50 text-green-900',
    yellow: 'bg-yellow-50 text-yellow-900',
    red: 'bg-red-50 text-red-900',
  }

  return (
    <div className={`rounded-lg shadow p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}
