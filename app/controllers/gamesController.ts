import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {secret} from '../jwtToken';
import {bigGames, gameAdmins, gameUsers} from '../socket';
import {Game, GameTypeLogic, Round} from '../logic/Game';
import {Team} from '../logic/Team';
import {BigGameDto} from "../dtos/bigGameDto";
import {BigGameLogic} from "../logic/BigGameLogic";
import {BigGameRepository} from "../db/repositories/bigGameRepository";
import {GameStatus, GameType} from "../db/entities/Game";
import {BigGame} from "../db/entities/BigGame";
import {TeamDto} from "../dtos/teamDto";

export class GamesController {
    public async getAll(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

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
                games: games?.map(value => new BigGameDto(value))
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
            const game = await getCustomRepository(BigGameRepository).findByName(gameName);
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
                await getCustomRepository(BigGameRepository).insertByParams(
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

            await getCustomRepository(BigGameRepository).delete(gameId);
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
            await getCustomRepository(BigGameRepository).updateNameById(gameId, newGameName);
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

            await getCustomRepository(BigGameRepository).updateAdminByIdAndAdminEmail(gameId, adminEmail);
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
            const game = await getCustomRepository(BigGameRepository).findWithAllRelations(gameId);
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }
            const rounds = game.games.find(game => game.type == GameType.CHGK).rounds;
            const answer = { // TODO: DTO
                name: game.name,
                isStarted: !!bigGames[gameId],
                id: game.id,
                teams: game.teams.map(value => value.name),
                roundCount: rounds.length,
                questionCount: rounds.length !== 0 ? rounds[0].questions.length : 0
            };
            return res.status(200).json(answer);
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
            const bigGame = await getCustomRepository(BigGameRepository).findWithAllRelations(gameId);
            if (!bigGame) {
                return res.status(404).json({message: 'game not found'});
            }
            const rounds = bigGame.games.find(game => game.type == GameType.CHGK).rounds;
            const answer = { // TODO: DTO
                name: bigGame.name,
                teams: bigGame.teams.map(value => value.name),
                roundCount: rounds.length,
                questionCount: rounds.length !== 0 ? rounds[0].questions.length : 0
            };
            gameAdmins[gameId] = new Set();
            gameUsers[gameId] = new Set();
            const ChGK = new Game(bigGame.name, GameTypeLogic.ChGK);
            const Matrix = new Game(bigGame.name, GameTypeLogic.Matrix);
            bigGames[bigGame.id] = new BigGameLogic(bigGame.name, ChGK, Matrix);
            setTimeout(() => {
                delete bigGames[gameId];
                delete gameUsers[gameId];
                delete gameAdmins[gameId];
                console.log('delete game ', bigGames[gameId]);
            }, 1000 * 60 * 60 * 24 * 3);
            const chgkFromBd = bigGame.games.find(game => game.type == GameType.CHGK);
            const matrixFromBd = bigGame.games.find(game => game.type == GameType.MATRIX);
            if (chgkFromBd) {
                for (let i = 0; i < chgkFromBd.rounds.length; i++) {
                    bigGames[gameId].ChGK.addRound(new Round(i + 1, answer.questionCount, 60, GameTypeLogic.ChGK));
                }

                for (const team of bigGame.teams) {
                    bigGames[gameId].ChGK.addTeam(new Team(team.name, team.id));
                }
            }
            if (matrixFromBd) {
                for (let i = 0; i < matrixFromBd.rounds.length; i++) {
                    bigGames[gameId].Matrix.addRound(new Round(i + 1, answer.questionCount, 60, GameTypeLogic.Matrix));
                }

                for (const team of bigGame.teams) {
                    bigGames[gameId].Matrix.addTeam(new Team(team.name, team.id));
                }
            }

            await getCustomRepository(BigGameRepository).updateByGameIdAndStatus(gameId, GameStatus.STARTED);
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

            const game = await getCustomRepository(BigGameRepository).findOne(gameId);
            if (!game) {
                return res.status(404).json({message: 'game not found'});
            }
            console.log('ChangeGame: ', gameId, ' teams is: ', teams);
            await getCustomRepository(BigGameRepository).updateByParams(
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

            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            bigGames[gameId].CurrentGame.isIntrigue = isIntrigue;
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
            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }
            const totalScore = bigGames[gameId].CurrentGame.getTotalScoreForAllTeams();
            const answer = {
                totalScoreForAllTeams: totalScore,
            };
            return res.status(200).json(answer); // TODO: убрать answer

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
            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            const token = req.cookies['authorization'];
            const {roles, teamId} = jwt.verify(token, secret) as jwt.JwtPayload;

            if (roles === 'user' && !teamId) {
                return res.status(400).json({message: 'user without team'});
            }

            const answer = { // TODO: DTO
                gameId,
                isIntrigue: bigGames[gameId].CurrentGame.isIntrigue,
                roundsCount: bigGames[gameId].CurrentGame.rounds.length,
                questionsCount: bigGames[gameId].CurrentGame.rounds[0].questionsCount,
                totalScoreForAllTeams: roles === 'user' && teamId && bigGames[gameId].CurrentGame.isIntrigue ?
                    bigGames[gameId].CurrentGame.getScoreTableForTeam(teamId) : bigGames[gameId].CurrentGame.getScoreTable(),
            };

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
            if (!bigGames[gameId]) {
                return res.status(404).json({'message': 'Игра не началась'});
            }

            const token = req.cookies['authorization'];
            const {roles, teamId} = jwt.verify(token, secret) as jwt.JwtPayload;

            if (roles === 'user' && !teamId) {
                return res.status(400).json({message: 'user without team'});
            }

            const headersList = ['Название команды', 'Сумма']; // TODO: DTO
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

            const answer = {
                totalTable: Game.getScoreTableWithFormat(bigGames[gameId].CurrentGame, scoreTable)
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
            await getCustomRepository(BigGameRepository).updateByGameIdAndStatus(gameId, status);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }
}
