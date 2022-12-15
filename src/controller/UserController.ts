import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { StatusCodes } from "http-status-codes";

export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const user = await this.userRepository.findOneBy({id: request.params.id})
        if (!user) {
            response.sendStatus(StatusCodes.NOT_FOUND)
            return
        }
        return user
    }

    async save(request: Request, response: Response, next: NextFunction) {
        // Lorsque undefined est passé findOneBy récupère le premier trouvé
        if(await this.userRepository.findOneBy({ login: String(request.body.login) }) !== null) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Le login est déjà utilisé" }
        }

        let user = new User()
        user.login = request.body.login
        user.password = request.body.password

        return this.userRepository.save(user).then(user => {
            response.status(StatusCodes.CREATED)
            return user
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les données" }
        })

    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOneBy({ id: request.params.id })
        if (!userToRemove) {
            response.sendStatus(StatusCodes.NOT_FOUND)
        }
        await this.userRepository.remove(userToRemove)
        response.sendStatus(StatusCodes.NO_CONTENT)
    }

    async update(request: Request, response: Response, next: NextFunction) {
        const idUser = request.params.id
        let userToUpdate = await this.userRepository.findOneBy({ id: idUser })
        if (!userToUpdate) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "User introuvable" }
        }

        userToUpdate.login = request.body.login
        userToUpdate.password = request.body.password

        return this.userRepository.save(userToUpdate).then(userUpdated => {
            return userUpdated
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

}