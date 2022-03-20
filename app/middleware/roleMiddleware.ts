import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import {secret} from "../jwtToken";

export function roleMiddleware(roles: Set<string>) {
    return function (req: Request, res: Response, next: NextFunction) {

        if (req.method === 'OPTIONS') {
            next()
        }

        try {
            const token = req.cookies['authorization'];
            if (!token) {
                return res.status(403).json({message: 'Пользователь не авторизован'});
            }

            const {roles: userRoles} = jwt.verify(token, secret) as jwt.JwtPayload;
            if (!roles.has(userRoles)) {
                return res.status(403).json({message: 'У пользователя нет прав'});
            }

            next();
        } catch (exception) {
            return res.status(403).json({message: 'Пользователь не авторизован'});
        }
    };
}