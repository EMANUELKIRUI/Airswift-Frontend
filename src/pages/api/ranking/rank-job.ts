/**
 * Rank Candidates for Job API
 * POST /api/ranking/rank-job
 *
 * Ranks all candidates for a specific job based on AI scores
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import rankingService from '@/services/rankingService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Check admin authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { jobId } = req.body

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' })
    }

    const rankedCandidates = await rankingService.rankCandidates(jobId)

    res.status(200).json({
      success: true,
      message: `Ranked ${rankedCandidates.length} candidates for job ${jobId}`,
      data: rankedCandidates
    })
  } catch (error: any) {
    console.error('Error ranking candidates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to rank candidates',
      error: error.message
    })
  }
}