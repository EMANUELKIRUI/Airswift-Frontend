/**
 * Get Top Candidates for Job API
 * GET /api/ranking/job/[jobId]/top-candidates
 *
 * Returns top-ranked candidates for a specific job
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import rankingService from '@/services/rankingService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Check admin authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { jobId } = req.query

    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({ message: 'Valid job ID is required' })
    }

    const limit = parseInt(req.query.limit as string) || 10
    const topCandidates = await rankingService.getTopCandidatesForJob(jobId, limit)

    res.status(200).json({
      success: true,
      data: topCandidates,
      count: topCandidates.length,
      jobId
    })
  } catch (error: any) {
    console.error('Error fetching top candidates for job:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top candidates for job',
      error: error.message
    })
  }
}