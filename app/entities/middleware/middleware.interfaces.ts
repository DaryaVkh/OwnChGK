import {Request} from 'express';
import jwt from 'jsonwebtoken';

export interface MiddlewareRequestInterface extends Request {
    user: string | jwt.JwtPayload;
}