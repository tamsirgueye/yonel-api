import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { SousAgence } from "../entity/SousAgence"
import { Agence } from "../entity/Agence"
import { Ville } from "../entity/Ville"
import { StatusCodes } from "http-status-codes"

export class SousAgenceController {

    private sousAgenceRepository = AppDataSource.getRepository(SousAgence)
    private agenceRepository = AppDataSource.getRepository(Agence)
    private villeRepository = AppDataSource.getRepository(Ville)

    /**
     * Retourne toutes les sous agences d’une agence
     * @param request
     * @param response
     * @param next
     */
    async all(request: Request, response: Response, next: NextFunction) {
        const idAgence = request.params.idAgence
        return await this.agenceRepository.findOneBy({ id: idAgence }).then(a => {
            if(a === null) {
                response.status(StatusCodes.NOT_FOUND)
                return { message: "Agence introuvable" }
            }
            return this.sousAgenceRepository.find({ where: { agence: a } }).then(sas => {
                return sas
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
     * Retourne une sous agence et son agence
     * @param request
     * @param response
     * @param next
     */
    async one(request: Request, response: Response, next: NextFunction) {
        const sousAgence = await this.sousAgenceRepository
            .createQueryBuilder('sa')
            .where({ id: request.params.id })
            .leftJoinAndSelect('sa.agence', 'a')
            .leftJoinAndSelect('sa.ville', 'v')
            .getOne()
        if (!sousAgence) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Sous Agence introuvable" }
        }
        return sousAgence
    }

    /**
     * Crée une nouvelle sous agence
     * @param request
     * @param response
     * @param next
     */
    async save(request: Request, response: Response, next: NextFunction) {
        const idAgence = request.params.idAgence
        const idVille = request.params.idVille
        return await this.agenceRepository.findOneBy({ id: idAgence }).then(async a => {
            if (a === null) {
                response.status(StatusCodes.NOT_FOUND)
                return {message: "Agence Introuvable"}
            }

            return await this.villeRepository.findOneBy({ id: idVille }).then(v => {
                if (v === null) {
                    response.status(StatusCodes.NOT_FOUND)
                    return { message: "Ville Introuvable" }
                }

                let sousAgence = new SousAgence()
                sousAgence.ville = v
                sousAgence.agence = a
                sousAgence.nom = request.body.nom
                sousAgence.adresse = request.body.adresse
                sousAgence.email = request.body.email
                sousAgence.telephone = request.body.telephone

                return this.sousAgenceRepository.save(sousAgence).then(sa => {
                    response.status(StatusCodes.CREATED)
                    return sa
                }).catch(e => {
                    response.status(StatusCodes.BAD_REQUEST)
                    return { message: "Vérifiez les données" }
                })
            }).catch(e => {
                response.status(StatusCodes.INTERNAL_SERVER_ERROR)
                return {}
            })
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return {}
        })

    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let sousAgenceToRemove = await this.sousAgenceRepository.findOneBy({ id: request.params.id })
        if (!sousAgenceToRemove) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Sous agence introuvable" }
        }
        return await this.sousAgenceRepository.remove(sousAgenceToRemove).then(sa => {
            return { message: "Sous agence supprimé avec succès" }
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return {}
        })
        
    }

}