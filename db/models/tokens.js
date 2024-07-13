'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tokens.init({
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
    type: {
      type: DataTypes.STRING,
      validate:{
        isIn: {args: [['Gemini', 'ChatGPT']], msg: 'Invalid LLM type'}
      },
      defaultValue: 'Gemini'
    },
    value: {
      type: DataTypes.INTEGER, //number of tokens
      allowNull: false
    },
    purchasedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING, //Comes from subscription or purchase
      validate:{
        isIn: {args: [['subscription', 'purchase']], msg: 'Invalid source'}
      },
      allowNull: false
    },
    expires: {
      type: DataTypes.DATE, //sould expire after 1 month(?)
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'tokens',
    underscored: true //underscored: true uses snake_case for attributes
  });
  return tokens;
};