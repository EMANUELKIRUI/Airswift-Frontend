import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';

class Job extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public location!: string;
}

Job.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Job',
});

export default Job;