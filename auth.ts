//NEXTAUTH
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

import SequelizeAdapter from "@auth/sequelize-adapter"
import { Sequelize } from "sequelize"
import mysql from 'mysql2';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  adapter: SequelizeAdapter(
    new Sequelize(process.env.DATABASE_URL || 'mysql://root:pass@localhost:3306/prompt2',{
      dialectModule: mysql,
      dialect: 'mariadb',
      logging: false// for enable set console.log not true,
    })
  ),
  session: {
     strategy:'jwt', //to be able to run on edge midleware we cant use database to store session
  },
});
