import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Agence } from "../entity/Agence"
import { StatusCodes } from "http-status-codes";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt"

const saltRounds = 10;
// generate salt to hash password
const salt = bcrypt.genSalt(saltRounds);

export class AgenceController {

    private agenceRepository = AppDataSource.getRepository(Agence)
    private userRepository = AppDataSource.getRepository(User)

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
        // agence.balance = request.body.balance

        return this.agenceRepository.save(agence).then(agence => {
            response.status(StatusCodes.CREATED)
            return agence
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
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

    async update(request: Request, response: Response, next: NextFunction) {
        const idAgence = request.params.id
        let agenceToUpdate = await this.agenceRepository.findOneBy({ id: idAgence })
        if (!agenceToUpdate) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Agence introuvable" }
        }

        if(await this.agenceRepository
            .createQueryBuilder('a')
            .where("a.id != :id", { id: idAgence })
            .andWhere({ nom: request.body.nom })
            .getOne()
        ) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Ce nom d'agence existe déjà dans la base de données" }
        }

        agenceToUpdate.nom = request.body.nom
        // agenceToUpdate.balance = request.body.balance
        agenceToUpdate.statut = request.body.statut

        return this.agenceRepository.save(agenceToUpdate).then(agenceUpdated => {
            return agenceUpdated
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les donnée envoyées" }
        })

    }

    async addUser(request: Request, response: Response, next: NextFunction) {
        const idAgence = parseInt(request.body.idAgence)
        const idUser = parseInt(request.body.idUser)

        if(!idAgence) {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "L'agence est obligatoire" }
        }

        const agence = await this.agenceRepository.findOneBy({ id: idAgence })
        if(!agence) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Agence introuvable" }
        }

        if(!idUser) {
            let user = new User()
            user.login = request.body.login
            user.password = await bcrypt.hash(request.body.password, await salt)
            user.agence = agence

            return this.userRepository.save(user).then(user => {
                response.status(StatusCodes.CREATED)
                const { password, ...userClean } = user
                return userClean
            }).catch(e => {
                response.status(StatusCodes.BAD_REQUEST)
                return { message: "Vérifiez les informations de l'utilisateur" }
            })
        }

        return this.userRepository.findOneBy({ id: idUser }).then(user => {
            user.agence = agence
            return this.userRepository.save(user)
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Utilisateur introuvable" }
        })
    }

}