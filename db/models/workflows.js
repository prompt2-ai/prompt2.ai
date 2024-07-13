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
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
      validate:{
        isUUID: 4
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT
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
    workflow: { //workflow XML as text
      allowNull: false,
      type: DataTypes.TEXT
    },
    image: { //image base64 as text
      allowNull: true,
      type: DataTypes.TEXT
    },      
    prompt: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    active: {
      defaultValue: true,
      type: DataTypes.BOOLEAN
    },
    private: {
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    tokensInput: {
      type: DataTypes.INTEGER,//the tokens required from Gemini for prompt
      allowNull: true
    },
    tokensOutput: {
       type: DataTypes.INTEGER,//the tokens required from Gemini for output
       allowNull: true
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
    modelName: 'workflows',
    underscored: true //underscored: true uses snake_case for attributes
  });
  return workflows;
};