import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Job from '../../../models/Job';
import sequelize from '../../../lib/database';

const secret = process.env.JWT_SECRET || 'secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  await sequelize.authenticate();

  if (req.method === 'GET') {
    try {
      const jobs = await Job.findAll();
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded: any = jwt.verify(token, secret);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { title, description, location } = req.body;
      const job = await Job.create({ title, description, location });
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
