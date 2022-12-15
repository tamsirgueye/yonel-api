import "reflect-metadata"
import { DataSource } from "typeorm"
require('dotenv').config()

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: false,
    entities: ['./**/entity/*.ts'],
    migrations: [],
    subscribers: [],
})
