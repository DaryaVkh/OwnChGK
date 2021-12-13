import {compare, hash} from 'bcrypt';
import {getCustomRepository} from 'typeorm';
import {UserRepository} from '../db/repositories/userRepository';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {generateAccessToken, secret} from '../jwtToken';
import jwt from 'jsonwebtoken';
import {SendMailWithTemporaryPassword} from "../email";
import {transporter} from "../app";

export class UsersController { // TODO: дописать смену имени пользователя, удаление
    public async getAll(req: Request, res: Response) {
        try {
            const {withoutTeam} = req.query;
            const users = withoutTeam ?
                await getCustomRepository(UserRepository).findUsersWithoutTeam()
                : await getCustomRepository(UserRepository).find();
            res.status(200).json({
                users: users.map(value => value.email)
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({message: error.message});
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const {email, password} = req.body;
            const user = await getCustomRepository(UserRepository).findByEmail(email);
            const isPasswordMatching = await compare(password, user.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(user.id, user.email,"user", null, null);
                res.cookie('authorization', token, {
                    maxAge: 86400 * 1000,
                    //httpOnly: true,
                    secure: true
                });
                res.status(200).redirect('/team-creation'); // TODO: редирект убрать во фронт
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
            const insertResult = await getCustomRepository(UserRepository).insertByEmailAndPassword(email, hashedPassword);
            const userId = insertResult.identifiers[0].id;
            const token = generateAccessToken(userId, email, "user", null, null);
            res.cookie('authorization', token, {
                maxAge: 24 * 60 * 60 * 1000,
                //httpOnly: true,
                secure: true
            });
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    // вызывается только если знаем, что у юзера текущего точно есть команда
    public async changeTokenWhenGoIntoGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            const oldToken = req.cookies['authorization'];
            const {id: userId, email: email, roles: userRoles} = jwt.verify(oldToken, secret) as jwt.JwtPayload;
            const user = await getCustomRepository(UserRepository).findOne(userId, {relations:['team']});
            const token = generateAccessToken(userId, email, userRoles, user.team.id, +gameId);
            res.cookie('authorization', token, {
                maxAge: 24 * 60 * 60 * 1000,
                //httpOnly: true,
                secure: true
            });

            if (user.team !== null) { //todo: проверку поправить
                res.status(200).json({
                    name: user.team.name,
                    id: user.team.id,
                    captainId: user.id,
                    captainEmail: user.email,
                });
            } else {
                res.status(200).json({});
            }
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async changePassword(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {email, password} = req.body;
            const hashedPassword = await hash(password, 10);
            await getCustomRepository(UserRepository).updateByEmailAndPassword(email, hashedPassword);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async SendPasswordWithTemporaryPassword(req: Request, res: Response) {
        const {email} = req.params;
        const code = Math.round(100 - 0.5 + Math.random() * (1000 - 100 + 1)).toString(); //случайное число от 100 до 1000
        SendMailWithTemporaryPassword(transporter, email, code);
        //todo: обращение к бд
        res.status(200).json({});
    }

    public async ConfirmTemporaryPassword(req: Request, res: Response) {
        const {email, code} = req.params;
        //todo: обращение к бд на проверку этого временного пароля
        res.status(200).json({});
    }

    public async logout(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            res.cookie('authorization', '', {
                maxAge: -1,
                //httpOnly: true,
                secure: true
            });
            res.status(200).redirect('/'); // TODO: редирект убрать во фронт
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }
}
