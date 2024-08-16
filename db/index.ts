'use strict';
import{ Sequelize,DataTypes, Options, Op } from "sequelize"
import { production, test, development } from "../config/dbconfig.js"
import mysql2 from 'mysql2'; // Needed to fix sequelize issues with WebPack

import UserModel  from "@/db/models/users"
import Workflows from "@/db/models/workflows"
import Tokens from "@/db/models/tokens"
import Prompts from "@/db/models/prompts"

const runningenv = process.env.NODE_ENV || 'development';
//load the config based on the running environment
const config = runningenv === 'production' ? production : runningenv === 'test' ? test : development;
const options = {
    ...config,
    dialect: 'mysql',// overide the default dialect, just in case
    dialectModule: mysql2,
}

const sequelize = new Sequelize({...options as Options});
const db = {
    User: UserModel(sequelize, DataTypes),
    Workflows: Workflows(sequelize, DataTypes),
    Tokens: Tokens(sequelize, DataTypes),
    Prompts: Prompts(sequelize, DataTypes),
    sequelize: sequelize,
    Sequelize: Sequelize,
    Op: Op,
}

export default db;
