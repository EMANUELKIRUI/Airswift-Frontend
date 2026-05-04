import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'user';
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  sequelize,
  modelName: 'User',
});

export default User;