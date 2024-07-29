'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class prompts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  prompts.init({
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
      validate:{
        isUUID: 4
      }
    },
    userId: { //foreign key to users table
      allowNull: false,
      foreignKey: true,
      references: {
        model: 'users',
        key: 'id'
      },
      type: DataTypes.STRING(36)
    },
    userPrompt: DataTypes.TEXT,
    prompt: DataTypes.TEXT,
    promptTokenCount: DataTypes.INTEGER,
    candidatesTokenCount: DataTypes.INTEGER,
    totalTokenCount: DataTypes.INTEGER,
    spendAt: {
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW,
      allowNull:false
    },
    createdAt: {
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW,
      allowNull:true
    },
    updatedAt: {
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW,
      allowNull:true
    }
  }, {
    sequelize,
    modelName: 'prompts',
    underscored: true //underscored: true uses snake_case for attributes
  });
  return prompts;
};