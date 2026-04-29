'use client'

import React, { useEffect, useState } from 'react'
import { applicationService } from '@/services/applicationService'
import { IApplication, AIScore } from '@/lib/models/Application'
import Link from 'next/link'

interface TopCandidate extends IApplication {
  user: {
    name: string
    email: string
    avatar?: string
  }
  job: {
    title: string
    company: string
  }
}

export default function TopCandidates({ jobId, limit = 20 }: { jobId?: string; limit?: number }) {
  const [candidates, setCandidates] = useState<TopCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopCandidates = async () => {
      try {
        setLoading(true)
        setError(null)
        let data
        if (jobId) {
          data = await applicationService.getJobTopCandidates(jobId, limit)
        } else {
          data = await applicationService.getTopCandidates(limit, jobId)
        }
        setCandidates(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidates')
        console.error('Error fetching top candidates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopCandidates()
  }, [jobId, limit])

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-blue-600 bg-blue-50'
    if (score >= 55) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800'
    if (score >= 70) return 'bg-blue-100 text-blue-800'
    if (score >= 55) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No candidates found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Top Candidates</h2>
        <p className="text-sm text-gray-600 mt-1">
          Ranked by AI assessment score
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Overall Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Communication
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((candidate, index) => (
              <tr key={String(candidate._id)} className="hover:bg-gray-50 transition-colors">
                {/* Rank */}
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {candidate.rank || index + 1}
                  </span>
                </td>

                {/* Candidate Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                      {candidate.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">{candidate.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </td>

                {/* Job Title */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {candidate.job?.title || 'N/A'}
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      candidate.status === 'shortlisted'
                        ? 'bg-green-100 text-green-800'
                        : candidate.status === 'accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : candidate.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {candidate.status?.charAt(0)?.toUpperCase()}{candidate.status?.slice(1) || 'Pending'}
                  </span>
                </td>

                {/* Overall Score */}
                <td className="px-6 py-4 text-center">
                  <div className={`inline-flex px-3 py-1 rounded-full font-bold text-sm ${getScoreBadgeColor(candidate.aiScore?.total || 0)}`}>
                    {(candidate.aiScore?.total || 0).toFixed(1)}
                  </div>
                </td>

                {/* Skills Score */}
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {(candidate.aiScore?.skills || 0).toFixed(1)}
                  </span>
                </td>

                {/* Experience Score */}
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {(candidate.aiScore?.experience || 0).toFixed(1)}
                  </span>
                </td>

                {/* Communication Score */}
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {(candidate.aiScore?.communication || 0).toFixed(1)}
                  </span>
                </td>

                {/* View Profile Link */}
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/applications/${candidate._id}`}>
                    <a className="text-blue-600 hover:text-blue-900 font-medium">
                      View
                    </a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Score Legend */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Score Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
            <span className="text-xs text-gray-600">85+ Excellent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
            <span className="text-xs text-gray-600">70-84 Good</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-600 mr-2"></div>
            <span className="text-xs text-gray-600">55-69 Moderate</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
            <span className="text-xs text-gray-600">&lt;55 Poor</span>
          </div>
        </div>
      </div>
    </div>
  )
}
