import jwt, {JwtPayload} from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
const secret = process.env.SECRET_KEY ?? "";

export function roleMiddleware(roles:boolean) {
    return function (req:Request, res:Response, next:NextFunction) {

        if (req.method === "OPTIONS") {
            next()
        }
        try {
            const token = req.cookies['authorization'];
            if (!token) {
                return res.status(403).json({message: "Пользователь не авторизован"});
            }

            // @ts-ignore
            //TODO: тип
            const {roles: userRoles} = jwt.verify(token, secret);

            let hasRole = false
            if (roles.toString() === userRoles.toString()) {
                hasRole = true;
                }

            if (!hasRole) {
                return res.status(403).json({message: "Пользователя нет прав"});
            }

            next();
        } catch (exception) {
            console.log(exception);
            return res.status(403).json({message: "Пользователь не авторизован"});
        }
    };
}