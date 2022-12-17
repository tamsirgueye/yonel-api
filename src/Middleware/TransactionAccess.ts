import { User } from "../entity/User";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "../data-source";

export class TransactionAccess {

    static async hasSousAgence(request: Request, response: Response, next: NextFunction) {
        const user = await AppDataSource.getRepository(User)
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.sousAgence", "sousAgence")
            .where({ id: request.user.user_id })
            .getOne()
        if(!user.sousAgence) {
            response.status(StatusCodes.FORBIDDEN)
            response.json({ message: "Action non autorisée" })
        } else {
            next()
        }
    }

}