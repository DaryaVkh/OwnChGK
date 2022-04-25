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
                    chgkSettings?.questionCost ?? 1
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
                    matrixSettings?.roundNames ?? null
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
                    chgkSettings?.questionCost ?? 1
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
                    matrixSettings?.roundNames ?? null
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
