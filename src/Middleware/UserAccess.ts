import { User } from "../entity/User";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class UserAccess {

    static canCreate(request: Request, response: Response, next: NextFunction) {
        if(!request.user.isAdmin) {
            response.status(StatusCodes.FORBIDDEN)
            response.json({ message: "Action non autorisée" })
        } else {
            next()
        }
    }

    static canGetCollection(request: Request, response: Response, next: NextFunction) {
        if(!request.user.isAdmin) {
            response.status(StatusCodes.FORBIDDEN)
            response.json({ message: "Action non autorisée" })
        } else {
            next()
        }
    }

    static canGet(request: Request, response: Response, next: NextFunction) {
        if(!request.user.isAdmin && (request.user.user_id != request.params.id)) {
            response.status(StatusCodes.FORBIDDEN)
            response.json({ message: "Action non autorisée" })
        } else {
            next()
        }
    }

    static canRemove(request: Request, response: Response, next: NextFunction) {
        if(!request.user.isAdmin) {
            response.status(StatusCodes.FORBIDDEN)
            response.json({ message: "Action non autorisée" })
        } else {
            next()
        }
    }

    static canUpdate(request: Request, response: Response, next: NextFunction) {
        if(!request.user.isAdmin && (request.user.user_id != request.params.id)) {
            response.status(StatusCodes.FORBIDDEN)
            response.json({ message: "Action non autorisée" })
        } else {
            next()
        }
    }
}