import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Agence } from "../entity/Agence"
import { StatusCodes } from "http-status-codes";

export class AgenceController {

    private agenceRepository = AppDataSource.getRepository(Agence)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.agenceRepository.find()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const agence = await this.agenceRepository
            .createQueryBuilder('a')
            .where({ id: request.params.id })
            .leftJoinAndSelect('a.sousAgences', 'sa')
            .getOne()
        if (!agence) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Agence introuvable" }
        }
        return agence
    }

    async save(request: Request, response: Response, next: NextFunction) {
        // Lorsque undefined est passé findOneBy récupère le premier trouvé
        if(await this.agenceRepository.findOneBy({ nom: String(request.body.nom) }) !== null) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Ce nom d'agence existe déjà dans la base de données" }
        }

        let agence = new Agence()
        agence.nom = request.body.nom
        agence.balance = request.body.balance

        return this.agenceRepository.save(agence).then(agence => {
            response.status(StatusCodes.CREATED)
            return agence
        }).catch(e => {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let agenceToRemove = await this.agenceRepository.findOneBy({ id: request.params.id })
        if (!agenceToRemove) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Agence introuvable" }
        }
        return await this.agenceRepository.remove(agenceToRemove).then(a => {
            return { message: "Agence supprimé avec succès" }
        }).catch(e => {
            response.status(StatusCodes.FORBIDDEN)
            return { message: "Pour supprimer cette agence vous devez d'abord supprimer ses sous agences" }
        })
        
    }

}