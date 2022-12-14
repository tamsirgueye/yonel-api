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
        this.userRepository.save(request.body).then(u => {
            response
                .status(StatusCodes.CREATED)
                .send({user: u})
            return
        }).catch(e => {
            response.sendStatus(StatusCodes.BAD_REQUEST)
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

}