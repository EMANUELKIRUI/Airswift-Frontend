import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Application from '../../../models/Application';
import User from '../../../models/User';
import Job from '../../../models/Job';
import sequelize from '../../../lib/database';

const secret = process.env.JWT_SECRET || 'secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await sequelize.authenticate();

    const applications = await Application.findAll({
      include: [
        { model: User, attributes: ['email'] },
        { model: Job, attributes: ['title', 'location'] },
      ],
    });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}