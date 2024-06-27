'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sessions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  sessions.init({
    expires: DataTypes.DATE,
    session_token: DataTypes.STRING(255),
    user_id: DataTypes.STRING(36),
  }, {
    sequelize,
    modelName: 'sessions',
  });
  return sessions;
};