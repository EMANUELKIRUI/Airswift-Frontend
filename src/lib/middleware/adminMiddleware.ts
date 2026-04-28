/**
 * Admin Authorization Middleware
 * Protects admin-only API routes
 */

import { NextApiRequest, NextApiResponse } from 'next'

interface RequestWithUser extends NextApiRequest {
  user?: {
    _id: string
    role: string
    email: string
    name: string
  }
}

/**
 * Middleware to check if user is authenticated and has admin role
 * Usage: app.get('/api/admin/*', isAdmin, handler)
 */
export function isAdmin(req: RequestWithUser, res: NextApiResponse, next?: () => void) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. Please login.' })
  }

  // Check if user has admin role
  if (req.user.role?.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' })
  }

  // User is admin, proceed
  if (next) next()
  return true
}

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: RequestWithUser, res: NextApiResponse, next?: () => void) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. Please login.' })
  }

  if (next) next()
  return true
}

/**
 * Middleware to check if user has specific role
 */
export function hasRole(role: string) {
  return (req: RequestWithUser, res: NextApiResponse, next?: () => void) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please login.' })
    }

    if (req.user.role?.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({
        message: `Access denied. ${role} rights required.`,
      })
    }

    if (next) next()
    return true
  }
}

/**
 * Middleware to apply multiple checks in sequence
 */
export function applyMiddleware(
  req: RequestWithUser,
  res: NextApiResponse,
  middlewares: Array<(req: RequestWithUser, res: NextApiResponse, next: () => void) => void>
) {
  let index = 0

  const next = () => {
    if (index < middlewares.length) {
      middlewares[index++](req, res, next)
    }
  }

  next()
}
