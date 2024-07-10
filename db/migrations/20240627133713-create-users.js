'use strict';
//CREATE TABLE IF NOT EXISTS `users` (`id` CHAR(36) BINARY , `name` VARCHAR(255), `email` VARCHAR(255), `email_verified` DATETIME, `image` VARCHAR(255), UNIQUE `email` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.CHAR(36)
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      email: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING(2048)
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },
      email_verified: {
        allowNull: true,
        type: Sequelize.DATE
      },
      phone_verified: {
        allowNull: true,
        type: Sequelize.DATE
      },
      image: {
        allowNull: true,
        type: Sequelize.STRING(1024)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};