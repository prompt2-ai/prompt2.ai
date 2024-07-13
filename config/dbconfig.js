let isOnBash = false;

//read the .env file from ../.env.local if this script called from command line
if (require.main.loaded) { //when called from sequelize-cli loaded is true
console.log('called from command line');
isOnBash = true;
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const envLines = env.split('\n');
envLines.forEach((line) => {
  const [key, value] = line.split('=');
  process.env[key] = value;
});
} else {
console.log('required as module');
}

module.exports = {
  development: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: isOnBash?"localhost":process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {
      connectTimeout: 1000
    },
    logging: console.log// for enable set console.log not true,
  },
  test: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {},
    logging: console.log// for enable set console.log not true,
  },
  production: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {},
    logging: console.log// for enable set console.log not true,
  }
};