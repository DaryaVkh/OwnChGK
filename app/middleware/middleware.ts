import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';

const secret = process.env.SECRET_KEY ?? 'SECRET_KEY';

export function middleware(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
        next();
    }

    try {
        const token = req.cookies['authorization'];
        if (!token) {
            return res.status(403).json({message: 'Пользователь не авторизован'});
        }

        // @ts-ignore
        //TODO: тип написать
        req.user = jwt.verify(token, secret);
        next();
    } catch (exception) {
        return res.status(403).json({message: 'Пользователь не авторизован'});
    }
}