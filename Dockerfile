# we have a mounted volume for the app directory
FROM node:20
WORKDIR /app
EXPOSE 3000
CMD [ "yarn", "dev", "--exit-zero" ]

