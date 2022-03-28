import {compare, hash} from 'bcrypt';
import {getCustomRepository} from 'typeorm';
import {UserRepository} from '../db/repositories/userRepository';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {generateAccessToken, secret} from '../jwtToken';
import jwt from 'jsonwebtoken';
import {makeTemporaryPassword, SendMailWithTemporaryPassword} from '../email';
import {transporter} from '../email';
import {UserDto} from "../dtos/userDto";
import {TeamDto} from "../dtos/teamDto";
import {AdminRepository} from "../db/repositories/adminRepository";
import {AdminDto} from "../dtos/adminDto";

export class UsersController { // TODO: дописать смену имени пользователя, удаление
    public async getAll(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {withoutTeam} = req.query;
            const users = withoutTeam ?
                await getCustomRepository(UserRepository).findUsersWithoutTeam()
                : await getCustomRepository(UserRepository).find();

            return res.status(200).json({
                users: users?.map(user => new UserDto(user))
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, password} = req.body;

            const user = await getCustomRepository(UserRepository).findByEmail(email);
            if (!user) {
                return res.status(404).json({message: 'user not found'});
            }

            const isPasswordMatching = await compare(password, user.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(user.id, user.email, 'user', null, null, user.name);
                res.cookie('authorization', token, {
                    maxAge: 86400 * 1000,
                    secure: true
                });
                return res.status(200).json(new UserDto(user));
            } else {
                return res.status(400).json({message: 'Not your password'});
            }
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async insert(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, password} = req.body;
            
            const user = await getCustomRepository(UserRepository).findOne({email})
            if (user) {
                return res.status(409).json({message: 'The user with this email is already registered'})
            }

            const hashedPassword = await hash(password, 10);
            const userFromDb = await getCustomRepository(UserRepository).insertByEmailAndPassword(email, hashedPassword);
            const userId = userFromDb.id;
            const token = generateAccessToken(userId, email, 'user', null, null);
            res.cookie('authorization', token, {
                maxAge: 24 * 60 * 60 * 1000,
                secure: true
            });

            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
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
                const user = await getCustomRepository(UserRepository).findById(userId);

                if (user?.team !== null) {
                    const token = generateAccessToken(userId, email, userRoles, user.team.id, gameId, name);
                    res.cookie('authorization', token, {
                        maxAge: 24 * 60 * 60 * 1000,
                        secure: true
                    });
                    return res.status(200).json({});
                }
            } else if (userRoles === 'admin' || userRoles === 'superadmin') {
                const token = generateAccessToken(userId, email, userRoles, null, gameId, name);
                res.cookie('authorization', token, {
                    maxAge: 24 * 60 * 60 * 1000,
                    secure: true
                });
                return res.status(200).json({});
            } else {
                return res.status(400).json({});
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async changeName(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {newName} = req.body;

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
                        secure: true
                    });
                    return res.status(200).json({});
                } else {
                    return res.status(404).json({});
                }
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async changePasswordByOldPassword(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, password, oldPassword} = req.body;

            const hashedPassword = await hash(password, 10);
            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (user) {
                if (await compare(oldPassword, user.password)) {
                    user.password = hashedPassword;
                    await user.save();
                    return res.status(200).json({});
                } else {
                    return res.status(403).json({message: 'oldPassword is invalid'})
                }
            } else {
                return res.status(404).json({message: 'user not found'});
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async changePasswordByCode(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, password, code} = req.body;

            const hashedPassword = await hash(password, 10);
            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (user) {
                if (user.temporary_code === code) {
                    user.password = hashedPassword;
                    user.temporary_code = null;
                    await user.save();
                    return res.status(200).json({});
                } else {
                    return res.status(403).json({message: 'code invalid'});
                }
            } else {
                return res.status(404).json({message: 'user not found'});
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async sendPasswordWithTemporaryPassword(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email} = req.body;

            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (user) {
                const code = makeTemporaryPassword(8);
                await SendMailWithTemporaryPassword(transporter, email, code);
                user.temporary_code = code;
                await user.save();
                return res.status(200).json({});
            } else {
                return res.status(404).json({message: 'user not found'});
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async confirmTemporaryPassword(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {email, code} = req.body;
            let user = await getCustomRepository(UserRepository).findByEmail(email);
            if (!user) {
                return res.status(404).json({message: 'user not found'});
            }

            if (user.temporary_code === code) {
                return res.status(200).json({});
            } else {
                return res.status(403).json({message: 'not your password'});
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
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
            const user = await getCustomRepository(UserRepository).findById(userId);

            if (user.team !== null) {
                return res.status(200).json(new TeamDto(user.team)); // TODO: может сломаться на фронте, если вызывается
            } else {
                return res.status(200).json({});
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
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
                roles: userRoles,
            } = jwt.verify(oldToken, secret) as jwt.JwtPayload;

            if (userId !== undefined) {
                if (userRoles === 'user') {
                    const user = await getCustomRepository(UserRepository).findById(userId);
                    return res.status(200).json(new UserDto(user));
                } else if (userRoles === 'admin' || userRoles === 'superadmin') {
                    const admin = await getCustomRepository(AdminRepository).findOne(+userId);
                    return res.status(200).json(new AdminDto(admin))
                } else {
                    return res.status(400).json({});
                }
            } else {
                return res.status(404).json({message: 'user/admin not found'});
            }
        } catch (error: any) {
            if (error.message === 'jwt must be provided') { // TODO: убрать)
                return res.status(401).json({});
            }

            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async logout(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            res.clearCookie('authorization');

            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }
}
