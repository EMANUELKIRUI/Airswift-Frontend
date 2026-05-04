import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';

class Application extends Model {
  public id!: number;
  public userId!: number;
  public jobId!: number;
  public status!: string;
}

Application.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Jobs',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'applied',
  },
}, {
  sequelize,
  modelName: 'Application',
});

export default Application;