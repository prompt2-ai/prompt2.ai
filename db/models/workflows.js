'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class workflows extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  workflows.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    user_id: DataTypes.STRING(36),
    workflow: DataTypes.STRING,
    prompt: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    private: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'workflows',
  });
  return workflows;
};