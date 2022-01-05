import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {GameRepository} from '../db/repositories/gameRepository';
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {secret} from '../jwtToken';
import {gameAdmins, games, gamesCurrentAnswer, gameUsers} from '../app';
import {Game, Round} from '../logic/Game';
import {Team} from '../logic/Team';
import {GameDTO} from '../dto';

export class GamesController {
    public async getAll(req: Request, res: Response) {
        try {
            const {amIParticipate} = req.query;
            let games: any;
            if (amIParticipate) {
                const oldToken = req.cookies['authorization'];
                const {id: userId} = jwt.verify(oldToken, secret) as jwt.JwtPayload;

                console.log('111111111111111');
                console.log(userId);
                if (!userId) {
                    console.log('true');
                    res.status(400).json({message: "userId is undefined"});
                    return;
                }
                games = await getCustomRepository(GameRepository).findAmIParticipate(userId); // TODO: ломается?
            } else {
                games = await getCustomRepository(GameRepository).find();
            }
            //games = await getCustomRepository(GameRepository).find();
            res.status(200).json({
                'games': games.map(value => new GameDTO(value))
            });
        } catch (error) {
            res.status(400).json({message: error.message});
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
            const {gameId} = req.params;
            const game = await getCustomRepository(GameRepository).findOne(gameId, {relations: ['teams', 'rounds']});
            if (!game) {
                res.status(404).json({});
                return;
            }
            const answer = {
                name: game.name,
                status: game.status,
                id: game.id,
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
            const {gameId} = req.params;
            const game = await getCustomRepository(GameRepository).findOne(+gameId, {relations: ['teams', 'rounds']});
            if (!game) {
                res.status(404).json({});
                return;
            }
            const answer = {
                name: game.name,
                teams: game.teams.map(value => value.name),
                roundCount: game.rounds.length,
                questionCount: game.rounds.length !== 0 ? game.rounds[0].questionCount : 0
            };
            gameAdmins[game.id] = new Set();
            gameUsers[game.id] = new Set();
            gamesCurrentAnswer[gameId] = [1, 1];
            games[game.id] = new Game(game.name);
            for (let i = 0; i < game.rounds.length; i++) {
                games[game.id].addRound(new Round(i + 1, answer.questionCount, 60, 1));
            }
            for (const team of game.teams) {
                games[game.id].addTeam(new Team(team.name, team.id));
            }
            await getCustomRepository(GameRepository).updateByGameIdAndStatus(gameId, "started");
            console.log('GAMEADMINS:', gameAdmins);
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
            const {gameId} = req.params;
            const {newGameName, roundCount, questionCount, teams} = req.body;
            const token = req.cookies['authorization'];
            const payLoad = jwt.verify(token, secret);
            if (typeof payLoad !== 'string') {
                console.log('ChangeGame:', teams);
                await getCustomRepository(GameRepository).updateByParams(
                    gameId, newGameName, roundCount, questionCount, 1, 60, teams
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
            await getCustomRepository(GameRepository).updateByGameIdAndStatus(gameName, status);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }
}