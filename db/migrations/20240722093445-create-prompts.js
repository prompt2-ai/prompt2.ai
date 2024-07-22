'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const DataTypes = Sequelize.DataTypes;
    await queryInterface.createTable('prompts', {
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
      prompt: {
        type: DataTypes.TEXT
      },
      prompt_token_count: {
        type: DataTypes.INTEGER
      },
      candidates_token_count: {
        type: DataTypes.INTEGER
      },
      total_token_count: {
        type: DataTypes.INTEGER
      },
      spend_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      created_at: {
        allowNull: true,
        type: DataTypes.DATE
      },
      updated_at: {
        allowNull: true,
        type: DataTypes.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('prompts');
  }
};