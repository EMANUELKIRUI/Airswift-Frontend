/**
 * Top Candidates Dashboard
 *
 * Displays AI-ranked top candidates with scores and rankings
 * Location: /pages/admin/top-candidates.tsx
 */

import { useState, useEffect } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import StatCard from '@/components/admin/StatCard'
<<<<<<< HEAD
import Table from '@/components/admin/Table'
import Chart from '@/components/admin/Chart'
=======
import { Table } from '@/components/admin/Table'
import { Chart } from '@/components/admin/Chart'
>>>>>>> a644836 (fix app)
import Loader from '@/components/Loader'
import api from '@/services/api'

interface Candidate {
  _id: string
  rank: number
  aiScore: {
    total: number
    skills: number
    experience: number
    communication: number
  }
  user: {
    _id: string
    name: string
    email: string
  }
  job: {
    _id: string
    title: string
    company: string
  }
  createdAt: string
}

interface RankingStats {
  totalCandidates: number
  averageScore: number
  topScore: number
  rankedJobs: number
}

export default function TopCandidatesDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<string>('all')

  useEffect(() => {
    fetchTopCandidates()
    fetchRankingStats()
  }, [])

  const fetchTopCandidates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/ranking/top-candidates?limit=50')
      setCandidates(response.data.data)
    } catch (err: any) {
      console.error('Error fetching top candidates:', err)
      setError('Failed to load top candidates')
    } finally {
      setLoading(false)
    }
  }

  const fetchRankingStats = async () => {
    try {
      // This would be a separate API endpoint for stats
      // For now, we'll calculate from the candidates data
      if (candidates.length > 0) {
        const totalCandidates = candidates.length
        const scores = candidates.map(c => c.aiScore.total)
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        const topScore = Math.max(...scores)
        const rankedJobs = new Set(candidates.map(c => c.job._id)).size

        setStats({
          totalCandidates,
          averageScore,
          topScore,
          rankedJobs
        })
      }
    } catch (err: any) {
      console.error('Error calculating stats:', err)
    }
  }

  useEffect(() => {
    if (candidates.length > 0) {
      fetchRankingStats()
    }
  }, [candidates])

  const handleRankJob = async (jobId: string) => {
    try {
      await api.post('/ranking/rank-job', { jobId })
      // Refresh data
      await fetchTopCandidates()
    } catch (err: any) {
      console.error('Error ranking job:', err)
      setError('Failed to rank candidates for job')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const tableColumns = [
    {
      key: 'rank',
      header: 'Rank',
      render: (candidate: Candidate) => (
        <span className="font-bold text-lg text-gray-900">
          #{candidate.rank}
        </span>
      )
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (candidate: Candidate) => (
        <div>
          <div className="font-semibold text-gray-900">{candidate.user.name}</div>
          <div className="text-sm text-gray-600">{candidate.user.email}</div>
        </div>
      )
    },
    {
      key: 'job',
      header: 'Applied For',
      render: (candidate: Candidate) => (
        <div>
          <div className="font-medium text-gray-900">{candidate.job.title}</div>
          <div className="text-sm text-gray-600">{candidate.job.company}</div>
        </div>
      )
    },
    {
      key: 'aiScore',
      header: 'AI Score',
      render: (candidate: Candidate) => (
        <div className="text-center">
          <div className={`font-bold text-xl ${getScoreColor(candidate.aiScore.total)}`}>
            {candidate.aiScore.total}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Skills: {candidate.aiScore.skills} | Exp: {candidate.aiScore.experience} | Comm: {candidate.aiScore.communication}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (candidate: Candidate) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBadge(candidate.aiScore.total)}`}>
          {candidate.aiScore.total >= 90 ? 'Excellent' :
           candidate.aiScore.total >= 80 ? 'Very Good' :
           candidate.aiScore.total >= 70 ? 'Good' : 'Needs Improvement'}
        </span>
      )
    }
  ]

  // Prepare chart data
  const scoreDistribution = candidates.reduce((acc, candidate) => {
    const range = Math.floor(candidate.aiScore.total / 10) * 10
    const key = `${range}-${range + 9}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(scoreDistribution).map(([range, count]) => ({
    name: range,
    value: count
  }))

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchTopCandidates}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎯 Top Candidates Dashboard</h1>
            <p className="text-gray-600 mt-1">AI-powered candidate ranking and scoring system</p>
          </div>
          <button
            onClick={fetchTopCandidates}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh Rankings
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Candidates"
              value={stats.totalCandidates}
              icon="👥"
              trend={null}
            />
            <StatCard
              title="Average Score"
              value={stats.averageScore}
              icon="📊"
              trend={null}
            />
            <StatCard
              title="Top Score"
              value={stats.topScore}
              icon="🏆"
              trend={null}
            />
            <StatCard
              title="Jobs Ranked"
              value={stats.rankedJobs}
              icon="💼"
              trend={null}
            />
          </div>
        )}

        {/* Score Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
          <Chart
            data={chartData}
            type="bar"
            dataKey="value"
            height={300}
          />
        </div>

        {/* Top Candidates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Top Ranked Candidates</h2>
            <p className="text-gray-600 mt-1">Candidates ranked by AI scoring algorithm</p>
          </div>

          <Table
            columns={tableColumns}
            data={candidates}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleRankJob('all')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🔄 Re-rank All Jobs
            </button>
            <button
              onClick={() => setSelectedJob('export')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              📤 Export Rankings
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}