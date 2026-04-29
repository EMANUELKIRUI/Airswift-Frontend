/**
 * Get Top Candidates API
 * GET /api/ranking/top-candidates
 *
 * Returns globally top-ranked candidates based on AI scores
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

    const limit = parseInt(req.query.limit as string) || 20
    const topCandidates = await rankingService.getTopCandidates(limit)

    res.status(200).json({
      success: true,
      data: topCandidates,
      count: topCandidates.length
    })
  } catch (error: any) {
    console.error('Error fetching top candidates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top candidates',
      error: error.message
    })
  }
}