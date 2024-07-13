'use strict';
import{ Sequelize,DataTypes,Options } from "sequelize"
import {production,test,development} from "../config/dbconfig.js"

import UserModel  from "@/db/models/users"
import Workflows from "@/db/models/workflows"
import Tokens from "@/db/models/tokens"

const runningenv = process.env.NODE_ENV || 'development';
//load the config based on the running environment
export const config = runningenv === 'production' ? production : runningenv === 'test' ? test : development;
const sequelize = new Sequelize({...config as Options});
export const db = {
    User: UserModel(sequelize, DataTypes),
    Workflows: Workflows(sequelize, DataTypes),
    Tokens: Tokens(sequelize, DataTypes),
    sequelize: sequelize,
    Sequelize: Sequelize
}

export default db;
