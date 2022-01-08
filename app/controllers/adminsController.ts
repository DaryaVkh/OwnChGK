import {getCustomRepository} from 'typeorm';
import {AdminRepository} from '../db/repositories/adminRepository';
import {compare, hash} from 'bcrypt';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {generateAccessToken} from '../jwtToken';
import {makeTemporaryPassword, SendMailWithTemporaryPassword} from '../email';
import {transporter} from '../socket';
import {UserRepository} from '../db/repositories/userRepository';

export class AdminsController {
    public async getAll(req: Request, res: Response) {
        try {
            const admins = await getCustomRepository(AdminRepository).find(); // TODO: а мейби суперадминов не надо?
            res.status(200).json({
                admins: admins.map(value => ({
                    email: value.email,
                    name: value.name
                }))
            });
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const {email, password} = req.body;
            const admin = await getCustomRepository(AdminRepository).findByEmail(email);
            if (!admin) {
                res.status(404).json({message: 'email invalid'});
            }
            const isPasswordMatching = await compare(password, admin.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(admin.id, admin.email, admin.role, null, null);
                res.cookie('authorization', token, {
                    maxAge: 24 * 60 * 60 * 1000,
                    //httpOnly: true,
                    secure: true
                });
                res.status(200).json({
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                });
            } else {
                res.status(400).json({message: 'Not your password'});
            }
        } catch (error) {
            res.status(400).json({message: error.message});
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

            await getCustomRepository(AdminRepository).insertByEmailAndPassword(email, hashedPassword);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async sendPasswordWithTemporaryPassword(req: Request, res: Response) {
        try {
            const {email} = req.body;
            if (!email) {
                res.status(400).json({'message': 'email is invalid'});
            }
            const code = makeTemporaryPassword(8);
            SendMailWithTemporaryPassword(transporter, email, code);
            let admin = await getCustomRepository(AdminRepository).findByEmail(email);
            if (admin) {
                admin.temporary_code = code;
                await admin.save();
                res.status(200).json({});
            } else {
                res.status(404).json({});
            }
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async confirmTemporaryPassword(req: Request, res: Response) {
        try {
            const {email, code} = req.body;
            let admin = await getCustomRepository(AdminRepository).findByEmail(email);
            if (!admin) {
                res.status(404).json({});
            }
            if (admin.temporary_code === code) {
                res.status(200).json({});
            } else {
                res.status(403).json({});
            }
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async changePasswordByOldPassword(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {email, password, oldPassword} = req.body;
            if (!email) {
                res.status(400).json({message: 'email invalid'})
            }
            const hashedPassword = await hash(password, 10);
            let admin = await getCustomRepository(AdminRepository).findByEmail(email);
            if (admin) {
                if (await compare(oldPassword, admin.password)) {
                    admin.password = hashedPassword;
                    await admin.save();
                } else {
                    res.status(403).json({message: 'oldPassword invalid'})
                }
            } else {
                res.status(404).json({message: 'email invalid'});
            }

            await getCustomRepository(AdminRepository).updateByEmailAndPassword(email, hashedPassword);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async changePasswordByCode(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {email, password, code} = req.body;
            if (!email) {
                res.status(400).json({message: 'email invalid'})
            }
            const hashedPassword = await hash(password, 10);
            let admin = await getCustomRepository(AdminRepository).findByEmail(email);
            if (admin) {
                if (admin.temporary_code === code) {
                    admin.password = hashedPassword;
                    admin.temporary_code = null;
                    await admin.save();
                } else {
                    res.status(403).json({'message': 'code invalid'});
                }
            } else {
                res.status(400).json({'message': 'email invalid'});
            }
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
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async delete(req: Request, res: Response) {
        //todo: makeMethod
    }
}