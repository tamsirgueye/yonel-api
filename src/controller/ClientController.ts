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

        let client = new Client()
        client.prenom = request.body.prenom
        client.nom = request.body.nom
        client.dateNaissance = request.body.dateNaissance
        client.lieuNaissance = request.body.lieuNaissance
        client.email = request.body.email
        client.telephone = request.body.telephone

        return this.clientRepository.save(client).then(client => {
            response.status(StatusCodes.CREATED)
            return client
        }).catch(e => {
            console.log(e)
            response.status(StatusCodes.BAD_REQUEST)
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

    async update(request: Request, response: Response, next: NextFunction) {
        const idClient = request.params.id
        let clientToUpdate = await this.clientRepository.findOneBy({ id: idClient })
        if (!clientToUpdate) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Client introuvable" }
        }

        if(await this.clientRepository
            .createQueryBuilder('c')
            .where("c.id != :id", { id: idClient })
            .andWhere({ email: request.body.email })
            .getOne()
        ) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "L'adresse email est déjà utilisée" }
        }

        clientToUpdate.prenom = request.body.prenom
        clientToUpdate.nom = request.body.nom
        clientToUpdate.dateNaissance = request.body.dateNaissance
        clientToUpdate.lieuNaissance = request.body.lieuNaissance
        clientToUpdate.email = request.body.email
        clientToUpdate.telephone = request.body.telephone

        return this.clientRepository.save(clientToUpdate).then(clientUpdated => {
            return clientUpdated
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

}