import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {GameRepository} from '../db/repositories/gameRepository';
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {secret} from '../jwtToken';
import {bigGames, gameAdmins, gameUsers} from '../socket';
import {Game, GameTypeLogic, Round} from '../logic/Game';
import {Team} from '../logic/Team';
import {BigGameDTO} from '../dto';
import {BigGameLogic} from "../logic/BigGameLogic";
import {BigGameRepository} from "../db/repositories/bigGameRepository";
import {GameStatus, GameType} from "../db/entities/Game";
import {BigGame} from "../db/entities/BigGame";

export class GamesController {
    public async getAll(req: Request, res: Response) {
        try {
            const {amIParticipate} = req.query;
            let games: BigGame[];
            if (amIParticipate) {
                const oldToken = req.cookies['authorization'];
                const {id: userId} = jwt.verify(oldToken, secret) as jwt.JwtPayload;
                console.log('user = ', userId, 'try to getAllGames');

                games = await getCustomRepository(BigGameRepository).findAmIParticipate(userId);
            } else {
                games = await getCustomRepository(BigGameRepository).find();
            }
            return res.status(200).json({
                'games': games.map(value => new BigGameDTO(value))
            });
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }

    public async getAllTeams(req: Request, res: Response) {
        try {
            const {gameName} = req.params;
            const game = await getCustomRepository(BigGameRepository).findByName(gameName);
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }
            return res.status(200).json(game.teams.map(team => team.name));
        } catch (error) {
            return res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async insertGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameName, roundCount, questionCount, teams} = req.body;
            if (!gameName
                || !roundCount
                || !questionCount
                || !teams
                || roundCount < 0
                || questionCount < 0) {
                return res.status(400).json({message: 'params is invalid'});
            }

            const token = req.cookies['authorization'];
            const payLoad = jwt.verify(token, secret);
            if (typeof payLoad !== 'string') {
                await getCustomRepository(BigGameRepository).insertByParams(
                    gameName, payLoad.email, roundCount, questionCount, 1, 60, teams);
                return res.status(200).json({});
            } else {
                res.send('You are not admin');
            }
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async deleteGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            if (!gameId) {
                return res.status(400).json({message: 'gameId is invalid'});
            }

            await getCustomRepository(GameRepository).delete(gameId);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
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
            await getCustomRepository(BigGameRepository).updateNameById(gameId, newGameName);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async editGameAdmin(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            const {admin} = req.body;
            await getCustomRepository(BigGameRepository).updateAdminByIdAndAdminEmail(gameId, admin);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async getGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            const game = await getCustomRepository(BigGameRepository).findOne(gameId, {relations: ['teams', 'rounds']});
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }
            const rounds = game.games.find(game => game.type == GameType.CHGK).rounds;
            const answer = {
                name: game.name,
                isStarted: !!bigGames[gameId],
                id: game.id,
                teams: game.teams.map(value => value.name),
                roundCount: rounds.length,
                questionCount: rounds.length !== 0 ? rounds[0].questions.length : 0
            };
            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async startGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            const game = await getCustomRepository(BigGameRepository).findOne(+gameId, {relations: ['teams', 'rounds']});
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }
            const rounds = game.games.find(game => game.type == GameType.CHGK).rounds;
            const answer = {
                name: game.name,
                teams: game.teams.map(value => value.name),
                roundCount: rounds.length,
                questionCount: rounds.length !== 0 ? rounds[0].questions.length : 0
            };
            gameAdmins[game.id] = new Set();
            gameUsers[game.id] = new Set();
            //тут у каждого своя game должна быть
            const ChGK = new Game(game.name, GameTypeLogic.ChGK);
            //const Matrix = new Game(game.name, GameTypeLogic.Matrix);
            bigGames[game.id] = new BigGameLogic(game.name, ChGK, null);
            setTimeout(() => {
                delete bigGames[gameId];
                delete gameUsers[gameId];
                delete gameAdmins[gameId];
                console.log('delete game ', bigGames[gameId]);
            }, 1000 * 60 * 60 * 24 * 3);
            const chgkFromBd = game.games.find(game => game.type == GameType.CHGK);
            for (let i = 0; i < chgkFromBd.rounds.length; i++) {
                bigGames[game.id].CurrentGame.addRound(new Round(i + 1, answer.questionCount, 60, 1));
            }
            for (const team of game.teams) {
                bigGames[game.id].CurrentGame.addTeam(new Team(team.name, team.id));
            }
            await getCustomRepository(BigGameRepository).updateByGameIdAndStatus(gameId, GameStatus.STARTED);
            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async changeGame(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            if (!gameId) {
                return res.status(400).json({message: 'gameId is invalid'});
            }
            const {newGameName, roundCount, questionCount, teams} = req.body;
            if (!newGameName
                || !roundCount
                || !questionCount
                || !teams) {
                return res.status(400).json({message: 'params is invalid'});
            }

            const token = req.cookies['authorization'];
            const payLoad = jwt.verify(token, secret);
            const game = await getCustomRepository(GameRepository).findOne(gameId);
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }
            if (typeof payLoad !== 'string') {
                console.log('ChangeGame: ', gameId, ' teams is: ', teams);
                await getCustomRepository(BigGameRepository).updateByParams(
                    gameId, newGameName, roundCount, questionCount, 1, 60, teams
                );
                return res.status(200).json({});
            } else {
                return res.status(403).json({message:'You are not admin'});
            }
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
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

            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            bigGames[gameId].CurrentGame.isIntrigue = isIntrigue;
            isIntrigue ? console.log('intrigue started') : console.log('intrigue finished');
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async getGameResult(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }
            const totalScore = bigGames[gameId].CurrentGame.getTotalScoreForAllTeams();
            const answer = {
                totalScoreForAllTeams: totalScore,
            };
            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async getGameResultScoreTable(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            const token = req.cookies['authorization'];
            const {roles, teamId} = jwt.verify(token, secret) as jwt.JwtPayload;

            if (roles === 'user' && !teamId) {
                return res.status(400).json({message: 'user without team'});
            }

            const answer = {
                gameId,
                isIntrigue: bigGames[gameId].CurrentGame.isIntrigue,
                roundsCount: bigGames[gameId].CurrentGame.rounds.length,
                questionsCount: bigGames[gameId].CurrentGame.rounds[0].questionsCount,
                totalScoreForAllTeams: roles === 'user' && teamId && bigGames[gameId].CurrentGame.isIntrigue ?
                    bigGames[gameId].CurrentGame.getScoreTableForTeam(teamId) : bigGames[gameId].CurrentGame.getScoreTable(),
            };

            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async getResultWithFormat(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId} = req.params;
            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            const token = req.cookies['authorization'];
            const {roles, teamId} = jwt.verify(token, secret) as jwt.JwtPayload;

            if (roles === 'user' && !teamId) {
                return res.status(400).json({message: 'user without team'});
            }

            const headersList = ['Название команды', 'Сумма'];
            for (let i = 1; i <= bigGames[gameId].CurrentGame.rounds.length; i++) {
                headersList.push('Тур ' + i);
                for (let j = 1; j <= bigGames[gameId].CurrentGame.rounds[i - 1].questionsCount; j++) {
                    headersList.push('Вопрос ' + j);
                }
            }
            const teamRows = [];
            const totalScoreForAllTeams = bigGames[gameId].CurrentGame.getTotalScoreForAllTeams();
            const scoreTable = roles === 'user' && teamId && bigGames[gameId].CurrentGame.isIntrigue ?
                    bigGames[gameId].CurrentGame.getScoreTableForTeam(teamId) : bigGames[gameId].CurrentGame.getScoreTable();
            let roundsResultList = [];
            for (const team in scoreTable) {
                let roundSum = 0;
                for (let i = 0; i < bigGames[gameId].CurrentGame.rounds.length; i++) {
                    for (let j = 0; j < bigGames[gameId].CurrentGame.rounds[i].questionsCount; j++) {
                        roundSum += scoreTable[team][i][j];
                    }
                    roundsResultList.push(roundSum);
                    roundsResultList.push(scoreTable[team][i].join(';'));
                    roundSum = 0;
                }
                teamRows.push(team + ';' + totalScoreForAllTeams[team] + ';' + roundsResultList.join(';'));
                roundsResultList = [];
            }

            const headers = headersList.join(';');
            const value = teamRows.join('\n');
            const answer = {
                totalTable: headers + '\n' + value,
            };
            console.log(answer.totalTable, 'gameId = ', gameId);
            return res.status(200).json(answer);
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
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
            await getCustomRepository(BigGameRepository).updateByGameIdAndStatus(gameId, status);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }
}