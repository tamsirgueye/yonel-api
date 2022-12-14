import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Devise } from "../entity/Devise"
import { StatusCodes } from "http-status-codes";

export class DeviseController {

    private deviseRepository = AppDataSource.getRepository(Devise)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.deviseRepository.find()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const devise = await this.deviseRepository.findOneBy({ id: request.params.id })
        if (!devise) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Devise introuvable" }
        }
        return devise
    }

    async save(request: Request, response: Response, next: NextFunction) {
        // Lorsque undefined est passé findOneBy récupère le premier trouvé
        if(await this.deviseRepository.findOneBy({ code: String(request.body.code) }) !== null) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Ce code de devise existe déjà dans la base de données" }
        }
        return this.deviseRepository.save(request.body).then(devise => {
            response.status(StatusCodes.CREATED)
            return devise
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let deviseToRemove = await this.deviseRepository.findOneBy({ id: request.params.id })
        if (!deviseToRemove) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Devise introuvable" }
        }
        return await this.deviseRepository.remove(deviseToRemove).then(c => {
            return { message: "Devise supprimé avec succès" }
        }).catch(e => {
            response.status(StatusCodes.FORBIDDEN)
            return { message: "Pour supprimer cette devise vous devez d'abord supprimer ses transactions" }
        })
        
    }

}