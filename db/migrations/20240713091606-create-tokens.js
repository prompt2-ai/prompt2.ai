'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const DataTypes = Sequelize.DataTypes;
    await queryInterface.createTable('tokens', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(36),
        validate:{
          isUUID: 4
        }
      },
      user_id: {
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
      purchased_at: {
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
      valid_from: {
        type: DataTypes.DATE,
        allowNull: false
      },
      expires: {
        type: DataTypes.DATE, //sould expire after 1 month(?)
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tokens');
  }
};