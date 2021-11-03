import DataBase from '../dbconfig/dbconnector';
import {compare, hash} from 'bcrypt';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {generateAccessToken} from "../jwtToken";

class UsersController {
    public async getAll(req: Request, res: Response) {
        try {
            const users = await DataBase.getAllUsers();
            res.status(200).json({
                users: users.map(value => value.email)
            });
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const {email, password} = req.body;
            const user = await DataBase.getUser(email);
            const isPasswordMatching = await compare(password, user.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(user.user_id, user.email, false);
                res.cookie('authorization', token, {
                    maxAge: 86400 * 1000,
                    httpOnly: true,
                    secure: true
                });
                res.status(200).redirect('/team-creation');
            } else {
                res.status(400).json({message: 'Not your password'});
            }
        } catch (error) {
            res.status(400).json({message: 'Cant find login'});
        }
    }

    public async insert(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, password} = req.body;
            const hashedPassword = await hash(password, 10);
            const userId = await DataBase.insertUser(email, hashedPassword);
            const token = generateAccessToken(userId, email, false);
            res.cookie('authorization', token, {
                maxAge: 86400 * 1000,
                httpOnly: true,
                secure: true
            });
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async changePassword(req: Request, res: Response, isAdmin = false) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const email = req.body.email;
            const newPassword = req.body.password;
            const hashedPassword = await hash(newPassword, 10);
            await DataBase.changeUserPassword(email, hashedPassword);
            res.send('Done');
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }
}

export default UsersController;