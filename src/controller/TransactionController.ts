import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { StatutTransaction, Transaction } from "../entity/Transaction"
import { StatusCodes } from "http-status-codes";
import { Client } from "../entity/Client";
import { Paiement } from "../entity/Paiement";
import { Pays } from "../entity/Pays";
import { Devise } from "../entity/Devise";
import { User } from "../entity/User";

export class TransactionController {

    private transactionRepository = AppDataSource.getRepository(Transaction)
    private clientRepository = AppDataSource.getRepository(Client)
    private paysRepository = AppDataSource.getRepository(Pays)
    private deviseRepository = AppDataSource.getRepository(Devise)

    /**
     * Récupère toutes les transactions
     * @param request
     * @param response
     * @param next
     */
    async all(request: Request, response: Response, next: NextFunction) {
        return this.transactionRepository.find()
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
        const idEmetteur = request.body.idEmetteur
        const idRecepteur = request.body.idRecepteur
        const idPaysOrigine = request.body.idPaysOrigine
        const idPaysDestination = request.body.idPaysDestination
        const idDeviseOrigine = request.body.idDeviseOrigine
        const idDeviseDestination = request.body.idDeviseDestination

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
                    transaction.userCreateur = await AppDataSource.getRepository(User).findOneBy({ id: request.user.user_id })

                    return this.transactionRepository.save(transaction).then(transaction => {
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
        await this.transactionRepository.remove(transactionToRemove)
        response.sendStatus(StatusCodes.NO_CONTENT)
    }

    /**
     * Paye une transaction
     * @param request
     * @param response
     * @param next
     */
    async pay(request: Request, response: Response, next: NextFunction) {
        const idTransaction = request.body.idTransaction
        if(!idTransaction) {
            response.status(StatusCodes.BAD_REQUEST)
            return { message: "La transaction est requise" }
        }
        const transaction = await this.transactionRepository
            .createQueryBuilder('t')
            .where({ id: idTransaction })
            .leftJoinAndSelect('t.client', 'c')
            .leftJoinAndSelect('t.paiement', 'p')
            .getOne()
        if (!transaction) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Transaction introuvable" }
        }

        if(transaction.paiement) {
            return { message: "Transaction déjà payée" }
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
            .leftJoinAndSelect('t.client', 'client')
            .leftJoinAndSelect('t.devise', 'devise')
            .leftJoinAndSelect('t.pays', 'pays')
            .getOne()
        if (!transaction) {
            response.status(StatusCodes.NOT_FOUND)
            return { message: "Transaction introuvable" }
        }

        if(transaction.paiement) {
            return { message: "Transaction déjà payée" }
        }

        transaction.statut = StatutTransaction.CANCELED
        return this.transactionRepository.save(transaction)
    }

}