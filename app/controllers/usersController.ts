import {compare, hash} from 'bcrypt';
import {getCustomRepository} from 'typeorm';
import {UserRepository} from '../db/repositories/userRepository';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {generateAccessToken, secret} from '../jwtToken';
import jwt from 'jsonwebtoken';
import {makeTemporaryPassword, SendMailWithTemporaryPassword, validateEmail} from '../email';
import {transporter} from '../socket';

export class UsersController { // TODO: дописать смену имени пользователя, удаление
    public async getAll(req: Request, res: Response) {
        try {
            const {withoutTeam} = req.query;
            const users = withoutTeam ?
                await getCustomRepository(UserRepository).findUsersWithoutTeam()
                : await getCustomRepository(UserRepository).find();
            return res.status(200).json({
                users: users.map(value => value.email)
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({message: error.message});
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const {email, password} = req.body;
            const user = await getCustomRepository(UserRepository).findByEmail(email);
            if (!user) {
                return res.status(404).json({message: 'email is invalid'});
            }
            const isPasswordMatching = await compare(password, user.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(user.id, user.email, 'user', null, null, user.name);
                res.cookie('authorization', token, {
                    maxAge: 86400 * 1000,
                    //httpOnly: true,
                    secure: true
                });
                return res.status(200).json({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: 'user',
                    team: user.team?.name ?? ''
                });
            } else {
                return res.status(400).json({message: 'Not your password'});
            }
        } catch (error) {
            return res.status(400).json({message: 'Cant find login'});
        }
    }

    public async insert(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, password} = req.body;
            if (!validateEmail(email)) {
                return res.status(400).json({message: 'email is invalid'});
            }
            const hashedPassword = await hash(password, 10);
            const insertResult = await getCustomRepository(UserRepository).insertByEmailAndPassword(email, hashedPassword);
            const userId = insertResult.identifiers[0].id;
            const token = generateAccessToken(userId, email, 'user', null, null);
            res.cookie('authorization', token, {
                maxAge: 24 * 60 * 60 * 1000,
                //httpOnly: true,
                secure: true
            });
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
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
            const {
                id: userId,
                email: email,
                roles: userRoles,
                name: name
            } = jwt.verify(oldToken, secret) as jwt.JwtPayload;
            if (userRoles === 'user') {
                const user = await getCustomRepository(UserRepository).findOne(userId, {relations: ['team']});

                if (user?.team !== null) {
                    const token = generateAccessToken(userId, email, userRoles, user.team.id, +gameId, name);
                    res.cookie('authorization', token, {
                        maxAge: 24 * 60 * 60 * 1000,
                        //httpOnly: true,
                        secure: true
                    });
                    return res.status(200).json({});
                }
            } else if (userRoles === 'admin' || userRoles === 'superadmin') {
                const token = generateAccessToken(userId, email, userRoles, null, +gameId, name);
                res.cookie('authorization', token, {
                    maxAge: 24 * 60 * 60 * 1000,
                    //httpOnly: true,
                    secure: true
                });
                return res.status(200).json({});
            } else {
                return res.status(400).json({});
            }
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async changeName(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {newName} = req.body;
            if (!newName) {
                return res.status(400).json({});
            }

            const oldToken = req.cookies['authorization'];
            const payload = jwt.verify(oldToken, secret) as jwt.JwtPayload;
            if (payload.id) {
                const user = await getCustomRepository(UserRepository).findOne(payload.id);
                if (user) {
                    user.name = newName;
                    await user.save();
                    const newToken = generateAccessToken(payload.id, payload.email, payload.roles, payload.teamId, payload.gameId, newName);
                    res.cookie('authorization', newToken, {
                        maxAge: 24 * 60 * 60 * 1000,
                        //httpOnly: true,
                        secure: true
                    });
                    return res.status(200).json({});
                } else {
                    return res.status(404).json({});
                }
            }
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async changePasswordByOldPassword(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {email, password, oldPassword} = req.body;
            if (!validateEmail(email)) {
                return res.status(400).json({message: 'email is invalid'});
            }
            const hashedPassword = await hash(password, 10);
            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (user) {
                if (await compare(oldPassword, user.password)) {
                    user.password = hashedPassword;
                    await user.save();
                    return res.status(200).json({});
                } else {
                    return res.status(403).json({message: 'oldPassword invalid'})
                }
            } else {
                return res.status(404).json({message: 'email invalid'});
            }
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async changePasswordByCode(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {email, password, code} = req.body;
            if (!validateEmail(email)) {
                return res.status(400).json({message: 'email is invalid'})
            }
            const hashedPassword = await hash(password, 10);
            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (user) {
                if (user.temporary_code === code) {
                    user.password = hashedPassword;
                    user.temporary_code = null;
                    await user.save();
                    return res.status(200).json({});
                } else {
                    return res.status(403).json({'message': 'code invalid'});
                }
            } else {
                return res.status(400).json({'message': 'email invalid'});
            }
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async sendPasswordWithTemporaryPassword(req: Request, res: Response) {
        try {
            const {email} = req.body;
            if (!validateEmail(email)) {
                return res.status(400).json({'message': 'email is invalid'});
            }
            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (user) {
                const code = makeTemporaryPassword(8);
                SendMailWithTemporaryPassword(transporter, email, code);
                user.temporary_code = code;
                await user.save();
                return res.status(200).json({});
            } else {
                return res.status(404).json({message: 'user not found'});
            }
        } catch (error: any) {
            return res.status(500).json({'message': error.message});
        }
    }

    public async confirmTemporaryPassword(req: Request, res: Response) {
        try {
            const {email, code} = req.body;
            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (!user) {
                return res.status(404).json({message: 'user not found'});
            }

            if (user.temporary_code === code) {
                return res.status(200).json({});
            } else {
                return res.status(403).json({});
            }
        } catch (error: any) {
            return res.status(500).json({'message': error.message});
        }
    }

    public async getTeam(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const oldToken = req.cookies['authorization'];
            const {id: userId} = jwt.verify(oldToken, secret) as jwt.JwtPayload;
            const user = await getCustomRepository(UserRepository).findOne(userId, {relations: ['team']});

            if (user.team !== null) {
                return res.status(200).json({
                    name: user.team.name,
                    id: user.team.id,
                    captainId: user.id,
                    captainEmail: user.email,
                });
            } else {
                return res.status(200).json({});
            }
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async get(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const oldToken = req.cookies['authorization'];
            const {
                id: userId,
                email: email,
                roles: userRoles,
                name: name
            } = jwt.verify(oldToken, secret) as jwt.JwtPayload;

            if (userId !== undefined && email !== undefined && userRoles !== undefined) {
                if (userRoles === 'user') {
                    const user = await getCustomRepository(UserRepository).findOne(+userId, {relations: ['team']})
                    return res.status(200).json({
                        id: userId,
                        email,
                        name,
                        role: userRoles,
                        team: user?.team?.name ?? ''
                    })
                } else if (userRoles === 'admin' || userRoles === 'superadmin') {
                    return res.status(200).json({
                        id: userId,
                        email,
                        name,
                        role: userRoles,
                    })
                } else {
                    return res.status(400).json({});
                }
            } else {
                return res.status(404).json({});
            }
        } catch (error: any) {
            if (error.message === 'jwt must be provided') {
                return res.status(401).json({});
            }
            return res.status(400).json({'message': error.message});
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
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }
}
