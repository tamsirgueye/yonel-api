import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { StatutTransaction, Transaction } from "../entity/Transaction"
import { StatusCodes } from "http-status-codes";
import { Client } from "../entity/Client";
import { Paiement } from "../entity/Paiement";
import { Pays } from "../entity/Pays";
import { Devise } from "../entity/Devise";
import { User } from "../entity/User";
import { Agence } from "../entity/Agence";

export class TransactionController {

    private transactionRepository = AppDataSource.getRepository(Transaction)
    private clientRepository = AppDataSource.getRepository(Client)
    private paysRepository = AppDataSource.getRepository(Pays)
    private deviseRepository = AppDataSource.getRepository(Devise)
    private agenceRepository = AppDataSource.getRepository(Agence)
    private userRepository = AppDataSource.getRepository(User)

    /**
     * Récupère toutes les transactions
     * @param request
     * @param response
     * @param next
     */
    async all(request: Request, response: Response, next: NextFunction) {
        return this.transactionRepository
            .createQueryBuilder("t")
            .leftJoinAndSelect("t.deviseOrigine", "do")
            .leftJoinAndSelect("t.deviseDestination", "dd")
            .leftJoinAndSelect("t.paysOrigine", "po")
            .leftJoinAndSelect("t.paysDestination", "pd")
            .leftJoinAndSelect("t.emetteur", "em")
            .leftJoinAndSelect("t.recepteur", "re")
            .getMany()
    }

    /**
     * Retourne toutes les transactions d’un client
     * @param request
     * @param response
     * @param next
     */
    async allFromOneClient(request: Request, response: Response, next: NextFunction) {
        const idClient = request.params.idClient
        return await this.clientRepository.findOneBy({ id: idClient }).then(async client => {
            if(client === null) {
                response.status(StatusCodes.NOT_FOUND)
                return { message: "Client introuvable" }
            }
            return await this.transactionRepository.find({
                where: [
                    { emetteur: client },
                    { recepteur: client }],
                relations: [
                    'emetteur', 'recepteur', 'paysOrigine', 'paysDestination', 'deviseOrigine', 'deviseDestination'
                ] }
            ).then(transactions => {
                return transactions
            }).catch(e => {
                response.status(StatusCodes.INTERNAL_SERVER_ERROR)
                return
            })
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return
        })
    }

    /**
     * Retourne une transaction
     * @param request
     * @param response
     * @param next
     */
    async one(request: Request, response: Response, next: NextFunction) {
        const transaction = await this.transactionRepository
            .createQueryBuilder('t')
            .where({ id: request.params.id })
            .leftJoinAndSelect('t.emetteur', 'emetteur')
            .leftJoinAndSelect('t.recepteur', 'recepteur')
            .leftJoinAndSelect('t.paysOrigine', 'paysOrigine')
            .leftJoinAndSelect('t.paysDestination', 'paysDestination')
            .leftJoinAndSelect('t.deviseOrigine', 'deviseOrigine')
            .leftJoinAndSelect('t.deviseDestination', 'deviseDestination')
            .getOne()
        if (!transaction) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Transaction introuvable" }
        }
        return transaction
    }

    /**
     * Crée une nouvelle transaction
     * @param request
     * @param response
     * @param next
     */
    async save(request: Request, response: Response, next: NextFunction) {
        const idEmetteur = parseInt(request.body.idEmetteur)
        const idRecepteur = parseInt(request.body.idRecepteur)
        const idPaysOrigine = parseInt(request.body.idPaysOrigine)
        const idPaysDestination = parseInt(request.body.idPaysDestination)
        const idDeviseOrigine = parseInt(request.body.idDeviseOrigine)
        const idDeviseDestination = parseInt(request.body.idDeviseDestination)

        if(!(idEmetteur && idRecepteur && idPaysOrigine && idPaysDestination && idDeviseOrigine && idDeviseDestination)) {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Il y a des données manquantes" }
        }

        if(idEmetteur && idRecepteur && idEmetteur == idRecepteur) {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Émetteur et récepteur ne peuvent pas être identiques" }
        }

        return await this.clientRepository.find({
            where: [
                { id: idEmetteur },
                { id: idRecepteur }
            ]
        }).then(async clients => {
            if(clients.length < 2) {
                response.status(StatusCodes.NOT_FOUND)
                return { message: "Émetteur et/ou récepteur introuvable(s)" }
            }

            return await this.paysRepository.find({
                where: [
                    { id: idPaysOrigine },
                    { id: idPaysDestination }
                ]
            }).then(async pays => {
                // Tester si on a un pays d’origine et de destination
                if(!(pays.length == 2 || (pays.length == 1 && idPaysOrigine == idPaysDestination))) {
                    response.status(StatusCodes.NOT_FOUND)
                    return { message: "Pays origine et/ou pays destination introuvable(s)" }
                }

                return await this.deviseRepository.find({
                    where: [
                        { id: idDeviseOrigine },
                        { id: idDeviseDestination }
                    ]
                }).then(async devises => {
                    // Tester si on a une devise d’origine et de destination
                    if(!(devises.length == 2 || (devises.length == 1 && idDeviseOrigine == idDeviseDestination))) {
                        response.status(StatusCodes.NOT_FOUND)
                        return { message: "Devise origine et/ou devise destination introuvable(s)" }
                    }

                    let transaction = new Transaction()
                    transaction.emetteur = clients.find((client) => client.id == idEmetteur)
                    transaction.recepteur = clients.find((client) => client.id == idRecepteur)
                    transaction.paysOrigine = pays.find((pays) => pays.id == idPaysOrigine)
                    transaction.paysDestination = pays.find((pays) => pays.id == idPaysDestination)
                    transaction.deviseOrigine = devises.find((devise) => devise.id == idDeviseOrigine)
                    transaction.deviseDestination = devises.find((devise) => devise.id == idDeviseDestination)
                    transaction.montantReception = request.body.montantReception
                    transaction.frais = request.body.frais
                    transaction.montantTotal = request.body.montantTotal
                    const user = await this.userRepository
                        .createQueryBuilder("u")
                        .leftJoinAndSelect("u.sousAgence", "sousAgence")
                        .where({ id: request.user.user_id })
                        .getOne()
                    let agence = await this.agenceRepository.findOneBy({ sousAgences: user.sousAgence })
                    if(agence.balance < transaction.montantTotal) {
                        response.status(StatusCodes.SERVICE_UNAVAILABLE)
                        return { message: "Balance insuffisante" }
                    }
                    agence.balance -= transaction.montantTotal
                    transaction.userCreateur = user

                    return this.transactionRepository.save(transaction).then(transaction => {
                        // Appliquez le débit de la balance si la transaction a été bien sauvegardée
                        this.agenceRepository.save(agence)

                        setTimeout(() => {
                            transaction.statut = StatutTransaction.PAYABLE
                            this.transactionRepository.save(transaction)
                        }, 40000)

                        response.status(StatusCodes.CREATED)
                        return transaction
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
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return {}
        })

    }

    /**
     * Supprime une transaction
     * @param request
     * @param response
     * @param next
     */
    async remove(request: Request, response: Response, next: NextFunction) {
        let transactionToRemove = await this.transactionRepository.findOneBy({ id: request.params.id })
        if (!transactionToRemove) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Transaction introuvable" }
        }

        let agence
        if(transactionToRemove.statut != StatutTransaction.PAID) {
            const user = await this.userRepository
                .createQueryBuilder("u")
                .leftJoinAndSelect("u.sousAgence", "sousAgence")
                .where({ id: request.user.user_id })
                .getOne()
            agence = await this.agenceRepository.findOneBy({ sousAgences: user.sousAgence })
        }

        this.transactionRepository.remove(transactionToRemove).then(transaction => {
            agence.balance += transaction.montantTotal
            this.agenceRepository.save(agence)
            response.sendStatus(StatusCodes.NO_CONTENT)
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return { message: "Problème rencontré lors de la suppression de la transaction" }
        })
    }

    /**
     * Paye une transaction
     * @param request
     * @param response
     * @param next
     */
    async pay(request: Request, response: Response, next: NextFunction) {
        const idTransaction = parseInt(request.body.idTransaction)
        if(!idTransaction) {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "La transaction est requise" }
        }
        const transaction = await this.transactionRepository
            .createQueryBuilder('t')
            .where({ id: idTransaction })
            .leftJoinAndSelect('t.paiement', 'p')
            .getOne()
        if (!transaction) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Transaction introuvable" }
        }

        if(transaction.paiement) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Transaction déjà payée" }
        }

        if(transaction.statut == StatutTransaction.CANCELED) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "Cette transaction est annulée"}
        }

        let paiement = new Paiement()
        paiement.nomCompletRecepteur = request.body.nomCompletRecepteur
        paiement.typePieceIdentite = request.body.typePieceIdentite
        paiement.numeroPieceIdentite = request.body.numeroPieceIdentite
        transaction.paiement = paiement
        transaction.statut = StatutTransaction.PAID

        return this.transactionRepository.save(transaction).then(transaction => {
            return transaction
        }).catch(e => {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "Vérifiez les données" }
        })
    }

    /**
     * Annule une transaction
     * @param request
     * @param response
     * @param next
     */
    async cancel(request: Request, response: Response, next: NextFunction) {
        const transaction = await this.transactionRepository
            .createQueryBuilder('t')
            .where({ id: request.params.id })
            .leftJoinAndSelect('t.paiement', 'paiement')
            .getOne()
        if (!transaction) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Transaction introuvable" }
        }

        if(transaction.paiement) {
            return { message: "Transaction déjà payée" }
        }

        if(transaction.statut == StatutTransaction.CANCELED) {
            response.status(StatusCodes.UNPROCESSABLE_ENTITY)
            return { message: "transaction Déjà annulée" }
        }

        let agence
        const user = await this.userRepository
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.sousAgence", "sousAgence")
            .where({ id: request.user.user_id })
            .getOne()
        agence = await this.agenceRepository.findOneBy({ sousAgences: user.sousAgence })

        transaction.statut = StatutTransaction.CANCELED
        return this.transactionRepository.save(transaction).then(transaction => {
            agence.balance += transaction.montantTotal
            this.agenceRepository.save(agence)
            return transaction
        }).catch(e => {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR)
            return { message: "Échec de l'annulation de la transaction" }
        })
    }

}