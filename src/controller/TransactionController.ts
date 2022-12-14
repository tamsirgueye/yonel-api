import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Transaction } from "../entity/Transaction"
import { StatusCodes } from "http-status-codes";
import { Client } from "../entity/Client";
import { Paiement } from "../entity/Paiement";
import { Pays } from "../entity/Pays";
import { Devise } from "../entity/Devise";

export class TransactionController {

    private transactionRepository = AppDataSource.getRepository(Transaction)
    private clientRepository = AppDataSource.getRepository(Client)
    private paysRepository = AppDataSource.getRepository(Pays)
    private deviseRepository = AppDataSource.getRepository(Devise)

    /**
     * Retourne toutes les transactions d’un client
     * @param request
     * @param response
     * @param next
     */
    async all(request: Request, response: Response, next: NextFunction) {
        const idClient = request.params.idClient
        await this.clientRepository.findOneBy({ id: idClient }).then(c => {
            if(c === null) {
                response.sendStatus(StatusCodes.NOT_FOUND)
                return
            }
            this.transactionRepository.find({ where: { client: c } }).then(ts => {
                response.send(ts)
                return
            }).catch(e => {
                response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
                return
            })
        }).catch(e => {
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
            return
        })
    }

    /**
     * Retourne une transaction et le client concerné
     * @param request
     * @param response
     * @param next
     */
    async one(request: Request, response: Response, next: NextFunction) {
        const transaction = await this.transactionRepository
            .createQueryBuilder('t')
            .where({ id: request.params.id })
            .leftJoinAndSelect('t.client', 'c')
            .leftJoinAndSelect('t.paiement', 'p')
            .leftJoinAndSelect('t.devise', 'd')
            .leftJoinAndSelect('t.pays', 'pays')
            .getOne()
        if (!transaction) {
            response.sendStatus(StatusCodes.NOT_FOUND)
            return
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
        const idClient = request.params.idClient
        const idPays = request.params.idPays
        const idDevise = request.params.idDevise
        return await this.clientRepository.findOneBy({ id: idClient }).then(async client => {
            if(client === null) {
                response.status(StatusCodes.NOT_FOUND)
                return { message: "Client non trouvé" }
            }

            return await this.paysRepository.findOneBy({ id: idPays }).then(async pays => {
                if(pays === null) {
                    response.status(StatusCodes.NOT_FOUND)
                    return { message: "Pays non trouvé" }
                }

                return await this.deviseRepository.findOneBy({ id: idDevise }).then(devise => {
                    if(devise === null) {
                        response.status(StatusCodes.NOT_FOUND)
                        return { message: "Devise non trouvé" }
                    }

                    let transaction = new Transaction()
                    transaction.client = client
                    transaction.pays = pays
                    transaction.devise = devise
                    transaction.montantReception = request.body.montantReception
                    transaction.frais = request.body.frais
                    transaction.montantTotal = request.body.montantTotal

                    return this.transactionRepository.save(transaction).then(transaction => {
                        setTimeout(() => {
                            transaction.statut = "payable"
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
            response.sendStatus(StatusCodes.NOT_FOUND)
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
        const transaction = await this.transactionRepository
            .createQueryBuilder('t')
            .where({ id: request.params.id })
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
        transaction.statut = "payed"

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

        transaction.statut = "cancelled"
        return this.transactionRepository.save(transaction)
    }

}