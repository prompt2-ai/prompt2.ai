
//read the .env file from ../.env.local
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const envLines = env.split('\n');
envLines.forEach((line) => {
  const [key, value] = line.split('=');
  process.env[key] = value;
});

module.exports = {
  development: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: "localhost",
    port: process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {}
  },
  test: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {}
  },
  production: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {}
  }
};