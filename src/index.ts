import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
require('dotenv').config()

const PORT = process.env.APP_PORT || 3000

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
    app.use(bodyParser.json())

    app["get"]('/', (req, res) => res.send("<h1 style='text-align: center;background-color: darkgray'>Api</h1>"))

    Routes.forEach(collection => {
        collection.forEach(route => {
            (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
                const result = (new (route.controller as any))[route.action](req, res, next)
                if (result instanceof Promise) {
                    result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

                } else if (result !== null && result !== undefined) {
                    res.json(result)
                }
            })
        })
    })

    // setup express app here
    // ...

    // start express server
    app.listen(PORT)

    console.log(`Express server has started on port ${PORT}. Open http://localhost:${PORT}`)

}).catch(error => console.log(error))
