import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import User from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false,
});

// Associations
User.hasMany(Application, { foreignKey: 'userId' });
Application.belongsTo(User, { foreignKey: 'userId' });
Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// Sync database
sequelize.sync();

export default sequelize;
