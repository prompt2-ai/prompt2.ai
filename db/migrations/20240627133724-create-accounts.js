'use strict';
//CREATE TABLE IF NOT EXISTS `accounts` (`id` CHAR(36) BINARY , `type` VARCHAR(255) NOT NULL, `provider` VARCHAR(255) NOT NULL, `provider_account_id` VARCHAR(255) NOT NULL, `refresh_token` VARCHAR(255), `access_token` VARCHAR(255), `expires_at` INTEGER, `token_type` VARCHAR(255), `scope` VARCHAR(255), `id_token` TEXT, `session_state` VARCHAR(255), `user_id` CHAR(36) BINARY, PRIMARY KEY (`id`), FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.CHAR(36)
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      provider: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      provider_account_id: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      refresh_token: {
        type: Sequelize.STRING(255)
      },
      access_token: {
        type: Sequelize.STRING(255)
      },
      expires_at: {
        type: Sequelize.INTEGER(11)
      },
      token_type: {
        type: Sequelize.STRING(255)
      },
      scope: {
        type: Sequelize.STRING(255)
      },
      id_token: {
        type: Sequelize.TEXT
      },
      session_state: {
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
    await queryInterface.dropTable('accounts');
  }
};