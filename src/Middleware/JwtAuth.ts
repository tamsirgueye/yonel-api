import { StatusCodes } from "http-status-codes";
import { User } from "../entity/User";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken"
import {AppDataSource} from "../data-source";

export class JwtAuth {

    static newToken(user: User) {
        const token = jwt.sign(
            { user_id: user.id, login: user.login, isAdmin: user.isAdmin },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        const { password, ...userClean } = user;
        return { user: userClean, token: token };
    }

    static async verifyToken(request: Request, response: Response, next: NextFunction) {
        if(request.path === '/login' /*|| (request.path === '/users' && request.method === 'POST')*/)
            return next();

        const token =
            request.headers.authorization && request.headers.authorization.startsWith('Bearer') ? request.headers.authorization.split(' ')[1] : null;

        if (!token) {
            response.status(StatusCodes.FORBIDDEN)
            response.json({ message: "A token is required for authentication" })
            return
        }

        try {
            request.user = jwt.verify(token, process.env.TOKEN_KEY);
            if(! await AppDataSource.getRepository(User).findOneBy({ id: request.user.user_id })) {
                response.status(StatusCodes.UNAUTHORIZED)
                response.json({ message: "Vous n'êtes plus autorisés à accéder à l'api" })
                return
            }
            return next();
        } catch (err) {
            response.status(StatusCodes.UNAUTHORIZED)
            response.json({ message: "Invalid Token" })
            return
        }
    }
}