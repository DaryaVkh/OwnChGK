import DataBase from "../dbconfig/dbconnector";
import {compare, hash} from "bcrypt";
import jwt from "jsonwebtoken";
import {validationResult} from "express-validator";
import {Request, Response} from "express";

const secret = process.env.SECRET_KEY ?? "";

const generateAccessToken = (email: string, roles: boolean) => {
    const payload = {
        email,
        roles
    };

    return jwt.sign(payload, secret, {expiresIn: "24h"});
}

class UsersController {
    public async getAll(req:Request, res:Response) {
        try {
            const users = await DataBase.getAllUsers();
            res.send(users);
        } catch (error) {
            res.status(400).json({message: "Error"}).send(error);
        }
    }

    public async login(req:Request, res:Response) {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const user = await DataBase.getUser(email);
            const isPasswordMatching = await compare(password, user.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(user.email, user.is_admin);
                res.cookie('Authorization', token, {
                    maxAge: 86400 * 1000,
                    httpOnly: true,
                    secure: true
                });
                res.status(200).json({token});
            } else {
                res.status(400).json({message: "Not your password"});
            }
        } catch (error) {
            res.status(400).json({message: "Cant find login"});
        }
    }

    public async insert(req:Request, res:Response, isAdmin = false) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }

            const email = req.body.email;
            const password = req.body.password;
            const name = req.body.name;
            const hashedPassword = await hash(password, 10);
            await DataBase.insertUser(email, hashedPassword, name, isAdmin);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }
}

export default UsersController;