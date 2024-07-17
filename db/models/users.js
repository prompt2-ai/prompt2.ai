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
  users.init({ //model must me complete with all attributes and their types
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      validate:{
        isUUID: 4
      }
    },
    name: {
      type:DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(2048),
      allowNull: false,
      unique: true,
      validate:{
        isEmail: true
      }
    },
    phone: {
      type:DataTypes.STRING(255),
      allowNull: true
    },
    emailVerified: {
      type:DataTypes.DATE,
      allowNull: true
    },
    phoneVerified: {
      type:DataTypes.DATE,
      allowNull: true
    },
    image: {
      type:DataTypes.STRING(2048),//Store image URL as text
      allowNull: true
    },
    // google aistudio api key
    apiKey:{
      type:DataTypes.STRING(255),
      allowNull: true
    },
    //add stripe fields here
    stripeCustomerId: {
      type:DataTypes.STRING(255),
      allowNull: true
    },
    stripeSubscriptionId: {
      type:DataTypes.STRING(255),
      allowNull: true
    },
    stripePriceId: {
      type:DataTypes.STRING(255),
      allowNull: true
    },
    stripeCurrentPeriodEnd: {
      type:DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type:DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    role: {
      type:DataTypes.STRING(255),
      allowNull: true,
      defaultValue:'user', //allow user,subscriber,admin
      validate:{
        isIn: [['user','subscriber','custom','admin']]
      }
    },
    plan: {
      type:DataTypes.STRING(255),
      allowNull: false,
      defaultValue:'free', //allow free,month,yearly
      validate:{
        isIn: [['free','month','year']]
      }
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
  },{
    sequelize,
    modelName: 'users',
    underscored: true //underscored: true uses snake_case for attributes
  });
  return users;
};