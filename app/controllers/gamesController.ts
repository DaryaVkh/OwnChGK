import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {GameRepository} from '../db/repositories/gameRepository';
import {Request, Response} from 'express';
import jwt from "jsonwebtoken";
import {secret} from "../jwtToken";


export class GamesController {
    public async getAll(req: Request, res: Response) {
        try {
            const games = await getCustomRepository(GameRepository).find();
            res.status(200).json({
                'games': games.map(value => value.name)
            });
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async getAllTeams(req: Request, res: Response) {
        try {
            const {gameName} = req.body;
            const game = await getCustomRepository(GameRepository).findByName(gameName);
            res.status(200).json(game.teams.map(team => team.name));
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async insertGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameName, toursCount, questionsCount, teams} = req.body;
            const token = req.cookies['authorization'];
            const payLoad = jwt.verify(token, secret);
            if (typeof payLoad !== "string") {
                await getCustomRepository(GameRepository).insertByParams(
                    gameName, payLoad.email, toursCount, questionsCount, 1, 60, teams);
                res.status(200).json({});
            }
            else {
                res.send("You are not admin");
            }
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async deleteGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {name} = req.body;
            await getCustomRepository(GameRepository).deleteByName(name);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editGameName(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {name, newName} = req.body;
            await getCustomRepository(GameRepository).updateByNames(name, newName);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editGameAdmin(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {name, admin} = req.body;
            await getCustomRepository(GameRepository).updateByNameAndAdminEmail(name, admin);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async getGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {name} = req.body;
            const game = await getCustomRepository(GameRepository).findByName(name)
            res.status(200).json(game);
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async changeGameStatus(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {name, status} = req.body;
            await getCustomRepository(GameRepository).updateByNameAndStatus(name, status);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }
}