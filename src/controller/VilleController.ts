import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Ville } from "../entity/Ville"
import { Pays } from "../entity/Pays"
import { StatusCodes } from "http-status-codes"

export class VilleController {

    private villeRepository = AppDataSource.getRepository(Ville)
    private paysRepository = AppDataSource.getRepository(Pays)

    /**
     * Retourne toutes les villes
     * @param request
     * @param response
     * @param next
     */
    async all(request: Request, response: Response, next: NextFunction) {
        return this.villeRepository.find()
    }

    /**
     * Retourne toutes les villes d’un pays
     * @param request
     * @param response
     * @param next
     */
    async allFromOnePays(request: Request, response: Response, next: NextFunction) {
        const idPays = request.params.idPays
        return await this.paysRepository.findOneBy({ id: idPays }).then(p => {
            if(p === null) {
                response.status(StatusCodes.NOT_FOUND)
                return { message: "Pays introuvable" }
            }
            this.villeRepository.find({ where: { pays: p } }).then(vs => {
                return vs
            }).catch(e => {
                response.status(StatusCodes.INTERNAL_SERVER_ERROR)
                return {}
            })
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return {}
        })
    }

    /**
     * Retourne une ville et son pays
     * @param request
     * @param response
     * @param next
     */
    async one(request: Request, response: Response, next: NextFunction) {
        const ville = await this.villeRepository
            .createQueryBuilder('v')
            .where({ id: request.params.id })
            .leftJoinAndSelect('v.pays', 'p')
            .getOne()
        if (!ville) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Ville introuvable" }
        }
        return ville
    }

    /**
     * Enregistre une nouvelle ville dans un pays
     * @param request
     * @param response
     * @param next
     */
    async save(request: Request, response: Response, next: NextFunction) {
        const idPays = request.body.idPays
        if(!idPays) {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Le pays est obligatoire" }
        }
        return await this.paysRepository.findOneBy({ id: idPays }).then(p => {
            if(p === null) {
                response.status(StatusCodes.NOT_FOUND)
                return { message: "Pays Introuvable" }
            }

            let ville = new Ville()
            ville.pays = p
            ville.code = request.body.code
            ville.nom = request.body.nom

            return this.villeRepository.save(ville).then(v => {
                response.status(StatusCodes.CREATED)
                return v
            }).catch(e => {
                response.status(StatusCodes.BAD_REQUEST)
                return { message: "Vérifiez les données" }
            })
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return {}
        })

    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let villeToRemove = await this.villeRepository.findOneBy({ id: request.params.id })
        if (!villeToRemove) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Ville introuvable" }
        }
        return await this.villeRepository.remove(villeToRemove).then(v => {
            return { message: "Ville supprimé avec succès" }
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return { message: "Pour supprimer cette ville vous devez d'abord supprimer ses sous agences" }
        })
        
    }

    async update(request: Request, response: Response, next: NextFunction) {
        const idVille = request.params.id
        let villeToUpdate = await this.villeRepository.findOneBy({ id: idVille })
        if (!villeToUpdate) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Ville introuvable" }
        }

        villeToUpdate.code = request.body.code
        villeToUpdate.nom = request.body.nom

        return this.villeRepository.save(villeToUpdate).then(villeUpdated => {
            return villeUpdated
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

}