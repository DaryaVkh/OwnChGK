import {compare, hash} from 'bcrypt';
import {getCustomRepository} from 'typeorm';
import {UserRepository} from '../db/repositories/userRepository';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {generateAccessToken} from '../jwtToken';

export class UsersController { // TODO: дописать смену имени пользователя, удаление
    public async getAll(req: Request, res: Response) {
        try {
            const users = await getCustomRepository(UserRepository).find();
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
            const user = await getCustomRepository(UserRepository).findByEmail(email);
            const isPasswordMatching = await compare(password, user.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(user.id, user.email, false);
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
            console.log(this); // TODO: Почему-то здесь this === undefined;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, password} = req.body;
            const hashedPassword = await hash(password, 10);
            const insertResult = await getCustomRepository(UserRepository).insertByEmailAndPassword(email, hashedPassword);
            const userId = insertResult.identifiers[0].id;
            const token = generateAccessToken(userId, email, false);
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