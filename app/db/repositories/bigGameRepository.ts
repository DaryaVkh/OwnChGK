import {EntityRepository, getCustomRepository, In, Repository} from 'typeorm';
import {BigGame} from "../entities/BigGame";
import {Admin} from "../entities/Admin";
import {Team} from "../entities/Team";
import {Game, GameStatus, GameType} from "../entities/Game";
import {Round} from "../entities/Round";
import {GameRepository} from "./gameRepository";


export interface ChgkSettings {
    roundCount: number,
    questionCount: number,
    questionCost: number,
    questionTime: number,
    questions: Record<number, string[]>
}


export interface MatrixSettings extends ChgkSettings {
    roundNames: string[]
}


@EntityRepository(BigGame)
export class BigGameRepository extends Repository<BigGame> {
    findByName(name: string) {
        return this.findOne({name}, {relations: ['games', 'teams']});
    }

    findWithAllRelations(bigGameId: string) {
        return this.findOne(bigGameId, {relations: ['games', 'teams', 'teams.captain', 'games.rounds', 'games.rounds.questions']});
    }

    addPictureInQuestion(bigGameId: string, gamePart: string, roundNumber: number, questionNumber: number, picture: Buffer) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, bigGameId, {relations: ['games', 'games.rounds', 'games.rounds.questions']});
            console.log(gamePart, "1");
            const game = bigGame.games.find(game => game.type.toString() == gamePart);
            if (game) {
                const round = game.rounds.find(round => round.number == roundNumber);
                console.log(round)
                if (round) {
                    const question = round.questions.find(question => question.number == questionNumber);
                    console.log(question)
                    question.picture = picture;
                    console.log(picture);
                    await manager.save(question);
                    return question;
                }
            }
        });
    }

    findAmIParticipate(userId: string) {
        return this.createQueryBuilder("bigGames")
            .leftJoinAndSelect("bigGames.teams", "teams")
            .leftJoinAndSelect("teams.captain", "users")
            .where('teams.captain.id = :id', {id: userId})
            .getMany();
    }

    insertByParams(name: string,
                   adminEmail: string,
                   teams: string[],
                   chgkSettings: ChgkSettings,
                   matrixSettings: MatrixSettings) {
        return this.manager.transaction(async manager => {
            const admin = await manager.findOne(Admin, {email: adminEmail});
            const teamsFromDb = await manager.find(Team, {name: In(teams)});
            const bigGame = await manager.create(BigGame, {name, admin, teams: teamsFromDb});
            await manager.save(bigGame);

            if (chgkSettings) {
                const chgk = await manager.create(Game, {type: GameType.CHGK, bigGame});
                await manager.save(chgk);

                await manager.getCustomRepository(GameRepository).createRoundsWithQuestions(
                    chgkSettings?.roundCount ?? 0,
                    chgkSettings?.questionCount ?? 0,
                    chgk,
                    chgkSettings?.questionTime ?? 60,
                    chgkSettings?.questionCost ?? 1,
                    null,
                    chgkSettings?.questions ?? null
                )
            }

            if (matrixSettings) {
                const matrix = await manager.create(Game, {type: GameType.MATRIX, bigGame});
                await manager.save(matrix);

                await manager.getCustomRepository(GameRepository).createRoundsWithQuestions(
                    matrixSettings?.roundCount ?? 0,
                    matrixSettings?.questionCount ?? 0,
                    matrix,
                    matrixSettings?.questionTime ?? 20,
                    matrixSettings?.questionCost ?? 10,
                    matrixSettings?.roundNames ?? null,
                    matrixSettings?.questions ?? null
                )
            }

            return bigGame;
        });
    }

    updateByParams(bigGameId: string,
                   newName: string,
                   teams: string[],
                   chgkSettings: ChgkSettings,
                   matrixSettings: MatrixSettings) {
        return this.manager.transaction(async manager => {
            const teamsFromDb = await manager.find(Team, {name: In(teams)});
            const bigGame = await manager.findOne(BigGame, bigGameId, {relations: ['games']});
            bigGame.teams = teamsFromDb;
            bigGame.name = newName;
            await manager.save(bigGame);

            const chgk = bigGame.games.find(game => game.type == GameType.CHGK);
            const matrix = bigGame.games.find(game => game.type == GameType.MATRIX);
            if (chgk) {
                await manager.delete(Game, chgk.id);
            }
            if (matrix) {
                await manager.delete(Game, matrix.id);
            }

            if (chgkSettings) {
                const game = await manager.create(Game, {type: GameType.CHGK, bigGame});
                await manager.save(game);

                await manager.getCustomRepository(GameRepository).createRoundsWithQuestions(
                    chgkSettings?.roundCount ?? 0,
                    chgkSettings?.questionCount ?? 0,
                    game,
                    chgkSettings?.questionTime ?? 60,
                    chgkSettings?.questionCost ?? 1,
                    null,
                    chgkSettings?.questions ?? null
                )
            }

            if (matrixSettings) {
                const game = await manager.create(Game, {type: GameType.MATRIX, bigGame});
                await manager.save(game);

                await manager.getCustomRepository(GameRepository).createRoundsWithQuestions(
                    matrixSettings?.roundCount ?? 0,
                    matrixSettings?.questionCount ?? 0,
                    game,
                    matrixSettings?.questionTime ?? 20,
                    matrixSettings?.questionCost ?? 10,
                    matrixSettings?.roundNames ?? null,
                    matrixSettings?.questions ?? null
                )
            }

            return bigGame;
        });
    }

    updateNameById(bigGameId: string, newName: string) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, bigGameId);
            bigGame.name = newName;

            return manager.save(bigGame);
        });
    }

    updateAdminByIdAndAdminEmail(bigGameId: string, newAdminEmail: string) {
        return this.manager.transaction(async manager => {
            const admin = await manager.findOne(Admin, {email: newAdminEmail});
            const bigGame = await manager.findOne(BigGame, bigGameId);
            bigGame.admin = admin;

            return manager.save(bigGame);
        });
    }

    updateByGameIdAndStatus(bigGameId: string, newStatus: GameStatus) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, bigGameId);
            bigGame.status = newStatus;

            return manager.save(bigGame);
        })
    }
}
