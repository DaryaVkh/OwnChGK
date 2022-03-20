import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {GameRepository} from '../db/repositories/gameRepository';
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {secret} from '../jwtToken';
import {gameAdmins, games, gameUsers} from '../socket';
import {Game, Round} from '../logic/Game';
import {Team} from '../logic/Team';
import {GameDto} from "../dtos/gameDto";
import {TeamDto} from "../dtos/teamDto";
import {ScoreTableDto} from "../dtos/scoreTableDto";
import {GameStatus} from "../db/entities/Game";

export class GamesController {
    public async getAll(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {amIParticipate} = req.query;
            let games: any;
            if (amIParticipate) {
                const oldToken = req.cookies['authorization'];
                const {id: userId} = jwt.verify(oldToken, secret) as jwt.JwtPayload;
                console.log('user = ', userId, 'try to getAllGames');
                if (!userId) {
                    return res.status(400).json({message: 'userId is undefined'}); // вроде лишнее, ведь если он прошёл через middleware, то id у него точно есть
                }

                games = await getCustomRepository(GameRepository).findAmIParticipate(userId);
            } else {
                games = await getCustomRepository(GameRepository).find();
            }

            return res.status(200).json({
                games: games?.map(value => new GameDto(value))
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async getAllTeams(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameName} = req.params;

            const game = await getCustomRepository(GameRepository).findByName(gameName);
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }

            return res.status(200).json({
                teams: game.teams?.map(team => new TeamDto(team))
            })
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                error,
            });
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
                return res.status(200).json({});
            } else {
                res.status(403).json({message: 'You are not admin'});
            }
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async deleteGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;

            await getCustomRepository(GameRepository).delete(gameId);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async editGameName(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;
            const {newGameName} = req.body;

            await getCustomRepository(GameRepository).updateById(gameId, newGameName);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async editGameAdmin(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;
            const {adminEmail} = req.body;

            await getCustomRepository(GameRepository).updateByIdAndAdminEmail(gameId, adminEmail);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
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
                return res.status(404).json({message: 'game not found'});
            }

            return res.status(200).json(new GameDto(game));
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
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
                return res.status(404).json({message: 'game not found'});
            }

            const answer = new GameDto(game);

            gameAdmins[game.id] = new Set();
            gameUsers[game.id] = new Set();
            games[game.id] = new Game(game.name);

            setTimeout(() => {
                delete games[gameId];
                delete gameUsers[gameId];
                delete gameAdmins[gameId];
                console.log('delete game ', games[gameId]);
            }, 1000 * 60 * 60 * 24 * 3); // TODO: избавиться

            for (let i = 0; i < game.rounds.length; i++) {
                games[game.id].addRound(new Round(i + 1, answer.questionCount, 60, 1));
            }

            for (const team of game.teams) {
                games[game.id].addTeam(new Team(team.name, team.id));
            }

            await getCustomRepository(GameRepository).updateByGameIdAndStatus(gameId, GameStatus.STARTED);
            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
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

            const game = await getCustomRepository(GameRepository).findOne(gameId);
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }

            console.log('ChangeGame: ', gameId, ' teams is: ', teams);
            await getCustomRepository(GameRepository).updateByParams(
                gameId, newGameName, roundCount, questionCount, 1, 60, teams
            );

            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async changeIntrigueStatus(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;
            const {isIntrigue} = req.body;

            if (!games[gameId]) {
                return res.status(404).json({message: 'Игра не началась'});
            }

            games[gameId].isIntrigue = isIntrigue;
            isIntrigue ? console.log('intrigue started') : console.log('intrigue finished');
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async getGameResult(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;

            if (!games[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            const totalScore = games[gameId].getTotalScoreForAllTeams();

            return res.status(200).json({
                totalScoreForAllTeams: totalScore,
            });
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async getGameResultScoreTable(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;

            if (!games[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            const token = req.cookies['authorization'];
            const {roles, teamId} = jwt.verify(token, secret) as jwt.JwtPayload;

            if (roles === 'user' && !teamId) {
                return res.status(400).json({message: 'user without team'});
            }

            const answer = roles === 'user' && teamId && games[gameId].isIntrigue ?
                new ScoreTableDto(games[gameId]) : new ScoreTableDto(games[gameId], teamId);

            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async getResultWithFormat(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;
            if (!games[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            const token = req.cookies['authorization'];
            const {roles, teamId} = jwt.verify(token, secret) as jwt.JwtPayload;

            if (roles === 'user' && !teamId) {
                return res.status(400).json({message: 'user without team'});
            }

            const scoreTable = roles === 'user' && teamId && games[gameId].isIntrigue ?
                games[gameId].getScoreTableForTeam(teamId) : games[gameId].getScoreTable();

            const answer = {
                totalTable: Game.getScoreTableWithFormat(games[gameId], scoreTable)
            };

            console.log(answer.totalTable, 'gameId = ', gameId);
            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }

    public async changeGameStatus(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {gameId} = req.params;
            const {status} = req.body;

            await getCustomRepository(GameRepository).updateByGameIdAndStatus(gameId, status);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }
}