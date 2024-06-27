'use strict';
//CREATE TABLE IF NOT EXISTS `sessions` (`id` CHAR(36) BINARY , `expires` DATETIME NOT NULL, `session_token` VARCHAR(255) NOT NULL, `user_id` CHAR(36) BINARY, UNIQUE `sessionToken` (`session_token`), PRIMARY KEY (`id`), FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.CHAR(36)
      },
      expires: {
        allowNull: false,
        type: Sequelize.DATE
      },
      session_token: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      user_id: {
        foreignKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        type: Sequelize.CHAR(36)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sessions');
  }
};