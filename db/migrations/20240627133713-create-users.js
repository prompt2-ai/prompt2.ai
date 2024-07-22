'use strict';
//CREATE TABLE IF NOT EXISTS `users` (`id` CHAR(36) BINARY , `name` VARCHAR(255), `email` VARCHAR(255), `email_verified` DATETIME, `image` VARCHAR(255), UNIQUE `email` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const DataTypes = Sequelize.DataTypes;
    await queryInterface.createTable('users', {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.CHAR(36),
        validate: {
          isUUID: 4
        }
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(255)
      },
      email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(2048)
      },
      phone: {
        allowNull: true,
        type: DataTypes.STRING(255)
      },
      email_verified: {
        allowNull: true,
        type: DataTypes.DATE
      },
      phone_verified: {
        allowNull: true,
        type: DataTypes.DATE
      },
      image: {
        allowNull: true,
        type: DataTypes.STRING(1024)
      },
      // google aistudio api key
      api_key: {
        allowNull: true,
        type: DataTypes.STRING(255)
      },
      //add stripe fields here
      stripe_customer_id: {
        allowNull: true,
        type: DataTypes.STRING(255)
      },
      stripe_subscription_id: {
        allowNull: true,
        type: DataTypes.STRING(255)
      },
      stripe_price_id: {
        allowNull: true,
        type: DataTypes.STRING(255)
      },
      stripe_current_period_start: {
        allowNull: true,
        type: DataTypes.DATE
      },
      stripe_current_period_end: {
        allowNull: true,
        type: DataTypes.DATE
      },
      is_active: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      role: {
        allowNull: false,
        type: DataTypes.STRING(255),
        defaultValue: 'user',
        validate: {
          isIn: [['user', 'subscriber', 'custom', 'admin']]
       }
      },
      plan: {
        type:DataTypes.STRING(255),
        allowNull: false,
        defaultValue:'free', //allow free,monthly,yearly
        validate:{
          isIn: [['free','month','year']]
        }
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
    await queryInterface.dropTable('users');
  }
};