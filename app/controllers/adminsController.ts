import {getCustomRepository} from 'typeorm';
import {AdminRepository} from '../db/repositories/adminRepository';
import {compare, hash} from 'bcrypt';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {generateAccessToken} from '../jwtToken';

export class AdminsController {
    private readonly adminRepository = getCustomRepository(AdminRepository);

    public async getAll(req: Request, res: Response) {
        try {
            const admins = await this.adminRepository.find();
            res.status(200).json({
                admins: admins.map(value => value.email)
            });
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const {email, password} = req.body;
            const admin = await this.adminRepository.findByEmail(email);
            const isPasswordMatching = await compare(password, admin.password);
            if (isPasswordMatching) {
                const token = generateAccessToken(admin.id, admin.email, true);
                res.cookie('authorization', token, {
                    maxAge: 24 * 60 * 60 * 1000,
                    //httpOnly: true,
                    secure: true
                });
                res.status(200).json({});
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
            const email = req.body.email;
            const password = req.body.password;
            const hashedPassword = await hash(password, 10);

            await this.adminRepository.insertByEmailAndPassword(email, hashedPassword);
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
            await this.adminRepository.updateByEmailAndPassword(email, hashedPassword);
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
}