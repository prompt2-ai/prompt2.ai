* first forward the mariadb port on localhost via kubectl port-forward

Examples of how to use the sequelize-cli to create models and migrations
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

for production
PRODUCTION=true npx sequelize-cli db:migrate --env production
PRODUCTION=true npx sequelize-cli db:seed:all --env production

