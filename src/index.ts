import * as express from "express"
import * as bodyParser from "body-parser"
import * as cors from "cors"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import { User } from "./entity/User";
import * as bcrypt from 'bcrypt'
import { StatusCodes } from "http-status-codes";
import { JwtAuth } from "./Middleware/JwtAuth";

require('dotenv').config()

const PORT = process.env.APP_PORT || 3000

const saltRounds = 10
// generate salt to hash password
const salt = bcrypt.genSalt(saltRounds)

salt.then(salt => {
    bcrypt.hash("pass", salt).then(passHash => {
        console.log("Mot de passe crypté\n\tpass => " + passHash)
    })
})

const userRepository = AppDataSource.getRepository(User)

AppDataSource.initialize().then(async () => {

    const corsOptions = {
        origin: process.env.URL_CLIENT
    };
    // create express app
    const app = express()
    app.use(bodyParser.json())
    app.use(cors(corsOptions))
    app.use(JwtAuth.verifyToken)

    app["get"]('/', (req, res) => res.send("<h1 style='text-align: center;background-color: darkgray'>Api</h1>"))

    app.post('/login', async (req, res) => {
        const { login, password } = req.body

        if (!(login && password)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Login et mot de passe requis" })
        }

        const user = await userRepository
            .createQueryBuilder("u")
            .addSelect('u.password')
            .where({ login: login })
            .getOne()

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json(JwtAuth.newToken(user));
        } else {
            res.status(StatusCodes.BAD_REQUEST).send("Identifiants invalides");
        }

    })

    Routes.forEach(collection => {
        collection.forEach(route => {
            (app as any)[route.method](route.route, route.middleware || [], (req: Request, res: Response, next: Function) => {
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
