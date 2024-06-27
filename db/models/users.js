'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init({
    id: DataTypes.STRING(36),
    name: DataTypes.STRING(255),
    email: DataTypes.STRING(2048),
    phone: DataTypes.STRING(255),
    email_verified: DataTypes.DATE,
    phone_verified: DataTypes.DATE,
    image: DataTypes.STRING(1024)
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};