import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {GameRepository} from '../db/repositories/gameRepository';
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {secret} from '../jwtToken';
import {games} from '../app';
import {Game, Round} from '../logic/Game';
import {Team} from '../logic/Team';


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
            const {gameName} = req.params;
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
            const {gameName, roundCount, questionCount, teams} = req.body;
            const token = req.cookies['authorization'];
            const payLoad = jwt.verify(token, secret);
            if (typeof payLoad !== 'string') {
                await getCustomRepository(GameRepository).insertByParams(
                    gameName, payLoad.email, roundCount, questionCount, 1, 60, teams);
                res.status(200).json({});
            } else {
                res.send('You are not admin');
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
            const {gameName} = req.params;
            await getCustomRepository(GameRepository).deleteByName(gameName);
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
            const {gameName} = req.params;
            const {newGameName} = req.body;
            await getCustomRepository(GameRepository).updateByNames(gameName, newGameName);
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
            const {gameName} = req.params;
            const {admin} = req.body;
            await getCustomRepository(GameRepository).updateByNameAndAdminEmail(gameName, admin);
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
            const {gameName} = req.params;
            const game = await getCustomRepository(GameRepository).findByName(gameName);
            const answer = {
                name: game.name,
                teams: game.teams.map(value => value.name),
                roundCount: game.rounds.length,
                questionCount: game.rounds.length !== 0 ? game.rounds[0].questionCount : 0
            };
            res.status(200).json(answer);
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async startGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameName} = req.params;
            const game = await getCustomRepository(GameRepository).findByName(gameName);
            const answer = {
                name: game.name,
                teams: game.teams.map(value => value.name),
                roundCount: game.rounds.length,
                questionCount: game.rounds.length !== 0 ? game.rounds[0].questionCount : 0
            };
            games[game.id] = new Game(gameName);
            for (let i = 0; i < game.rounds.length; i++) {
                games[game.id].addRound(new Round(i + 1, answer.questionCount, 60, 1));
            }
            for (const team of game.teams) {
                games[game.id].addTeam(new Team(team.name, team.id));
            }
            res.status(200).json(answer);
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async changeGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameName} = req.params;
            const {newGameName, roundCount, questionCount, teams} = req.body;
            const token = req.cookies['authorization'];
            const payLoad = jwt.verify(token, secret);
            if (typeof payLoad !== 'string') {
                await getCustomRepository(GameRepository).updateByParams(
                    gameName, newGameName, roundCount, questionCount, 1, 60, teams
                );
                res.status(200).json({});
            } else {
                res.send('You are not admin');
            }
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

            const {gameName} = req.params;
            const {status} = req.body;
            await getCustomRepository(GameRepository).updateByNameAndStatus(gameName, status);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }
}