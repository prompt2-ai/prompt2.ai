'use strict';
//CREATE TABLE IF NOT EXISTS `verification_tokens` (`token` VARCHAR(255) , `identifier` VARCHAR(255) NOT NULL, `expires` DATETIME NOT NULL, PRIMARY KEY (`token`)) ENGINE=InnoDB;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verification_tokens', {
      expires: {
        allowNull: false,
        type: Sequelize.DATE
      },
      token: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(255)
      },
      identifier: {
        allowNull: false,
        type: Sequelize.STRING(255)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('verification_tokens');
  }
};