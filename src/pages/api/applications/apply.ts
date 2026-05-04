import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Application from '../../../models/Application';
import sequelize from '../../../lib/database';

const secret = process.env.JWT_SECRET || 'secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    const { jobId } = req.body;

    await sequelize.authenticate();

    const application = await Application.create({ userId: decoded.id, jobId, status: 'applied' });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}