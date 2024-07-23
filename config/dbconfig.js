//call from command line: PRODUCTION=true npx sequelize-cli db:seed:all to seed the database on production

let isOnBash = false;

//read the .env file from ../.env.local if this script called from command line
if (require.main.id==".") { //when called from sequelize-cli id is "."
console.log('called from command line with PRODUCTION=',process.env.PRODUCTION?'true':'false');
const envfile=process.env.PRODUCTION?'.env.production.local':'.env.development.local';
isOnBash = true;
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../', envfile);
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
    port: isOnBash?"3336":process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {
      connectTimeout: 1000
    },
    logging: console.log// for enable set console.log not true,to disable set false
  },
  test: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {},
    logging: false//console.log// for enable set console.log not true,
  },
  production: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: isOnBash?"localhost":process.env.MARIADB_HOST,
    port: isOnBash?"3306":process.env.MARIADB_PORT,
    dialect: 'mariadb',
    dialectOptions: {},
    logging: false//console.log// for enable set console.log not true,
  }
};