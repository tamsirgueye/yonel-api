import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Client } from "../entity/Client"
import { StatusCodes } from "http-status-codes";

export class ClientController {

    private clientRepository = AppDataSource.getRepository(Client)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.clientRepository.find()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const client = await this.clientRepository.findOneBy({id: request.params.id})
        if (!client) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Client introuvable" }
        }
        return client
    }

    async save(request: Request, response: Response, next: NextFunction) {
        // Lorsque undefined est passé findOneBy récupère le premier trouvé
        if(await this.clientRepository.findOneBy({ email: String(request.body.email) }) !== null) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "L'adresse email est déjà utilisée" }
        }
        return this.clientRepository.save(request.body).then(client => {
            response.status(StatusCodes.CREATED)
            return client
        }).catch(e => {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let clientToRemove = await this.clientRepository.findOneBy({ id: request.params.id })
        if (!clientToRemove) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Client introuvable" }
        }
        return await this.clientRepository.remove(clientToRemove).then(c => {
            return { message: "Compte client supprimé avec succès" }
        }).catch(e => {
            response.status(StatusCodes.FORBIDDEN)
            return { message: "Pour supprimer ce compte client vous devez d'abord supprimer ses transactions" }
        })
        
    }

}