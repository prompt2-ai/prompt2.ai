'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      user_id: {
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        type: Sequelize.STRING(36)
      },
      workflow: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      image: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      prompt: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      active: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      private: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workflows');
  }
};