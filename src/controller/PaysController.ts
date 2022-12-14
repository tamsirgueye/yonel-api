import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Pays } from "../entity/Pays"
import { StatusCodes } from "http-status-codes";

export class PaysController {

    private paysRepository = AppDataSource.getRepository(Pays)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.paysRepository.find()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const pays = await this.paysRepository
            .createQueryBuilder('p').where({ id: request.params.id })
            .leftJoinAndSelect('p.villes', 'vs')
            .getOne()
        if (!pays) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Pays introuvable" }
        }
        return pays
    }

    async save(request: Request, response: Response, next: NextFunction) {
        // Lorsque undefined est passé findOneBy récupère le premier trouvé
        if(await this.paysRepository.findOneBy({ nom: String(request.body.nom) }) !== null) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Ce nom de pays existe déjà dans la base de données" }
        }
        return this.paysRepository.save(request.body).then(pays => {
            response.status(StatusCodes.CREATED)
            return pays
        }).catch(e => {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let paysToRemove = await this.paysRepository.findOneBy({ id: request.params.id })
        if (!paysToRemove) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Pays introuvable" }
        }
        return await this.paysRepository.remove(paysToRemove).then(c => {
            return { message: "Pays supprimé avec succès" }
        }).catch(e => {
            response.status(StatusCodes.FORBIDDEN)
            return { message: "Pour supprimer ce pays vous devez d'abord supprimer ses transactions et ses villes" }
        })
        
    }

}