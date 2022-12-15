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
        if(await this.deviseRepository.findOneBy([
            { code: String(request.body.code) },
            { nom: String(request.body.nom) },
            { symbole: String(request.body.symbole) }
        ]) !== null) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Le code et/ou le nom et/ou le symbole renseigné(s) existe(nt) déjà dans la base" }
        }

        let devise = new Devise()
        devise.code = request.body.code
        devise.nom = request.body.nom
        devise.symbole = request.body.symbole
        devise.tauxConversion = request.body.tauxConversion
        devise.tauxFrais = request.body.tauxFrais

        return this.deviseRepository.save(devise).then(devise => {
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

    async update(request: Request, response: Response, next: NextFunction) {
        const idDevise = request.params.id
        let deviseToUpdate = await this.deviseRepository.findOneBy({ id: idDevise })
        if (!deviseToUpdate) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Devise introuvable" }
        }

        if(await this.deviseRepository
            .createQueryBuilder('d')
            .where("d.id != :id", { id: idDevise })
            .andWhere([
                { code: request.body.code },
                { nom: request.body.nom },
                { symbole: request.body.symbole }
            ])
            .getOne()
        ) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Le code et/ou le nom et/ou le symbole renseigné(s) existe(nt) déjà dans la base" }
        }

        deviseToUpdate.code = request.body.code
        deviseToUpdate.nom = request.body.nom
        deviseToUpdate.symbole = request.body.symbole
        deviseToUpdate.tauxConversion = request.body.tauxConversion
        deviseToUpdate.tauxFrais = request.body.tauxFrais

        return this.deviseRepository.save(deviseToUpdate).then(deviseUpdated => {
            return deviseUpdated
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

}