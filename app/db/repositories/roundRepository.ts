import {EntityRepository, Repository} from 'typeorm';
import {Round} from '../entities/Round';
import {GameType} from '../entities/Game';
import {BigGame} from "../entities/BigGame";
import {Question} from "../entities/Questions";

@EntityRepository(Round)
export class RoundRepository extends Repository<Round> {
    findByGameName(gameName: string) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, {name: gameName}, {relations: ['games', 'games.rounds']});
            const game = bigGame.games.find(game => game.type == GameType.CHGK);

            return game.rounds;
        });
    }

    insertByParams(number: number,
                   gameName: string,
                   questionCount: number,
                   questionCost: number,
                   questionTime: number) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, {name: gameName}, {relations: ['games']});
            const game = bigGame.games.find(game => game.type == GameType.CHGK);
            const round = await manager.create(Round, {number, game, questionTime});
            await manager.save(round);

            for (let i = 1; i <= questionCount; i++) {
                const question = await manager.create(Question, {cost: questionCost, round});
                await manager.save(question);
            }

            return round;
        });
    }

    deleteByGameNameAndNumber(bigGameId: string, number: number) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, bigGameId, {relations: ['games', 'games.rounds']});
            const game = bigGame.games.find(game => game.type == GameType.CHGK);

            return manager.delete(Round, {game, number});
        });
    }

    updateByParams(number: number,
                   bigGameId: string,
                   newQuestionNumber: number,
                   newQuestionCost: number,
                   newQuestionTime: number) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, bigGameId, {relations: ['games', 'games.rounds']});
            const game = bigGame.games.find(game => game.type == GameType.CHGK);
            await manager.delete(Round, {game, number});

            const round = await manager.create(Round, {number, game, questionTime: newQuestionTime});
            await manager.save(round);

            for (let i = 1; i <= newQuestionCost; i++) {
                const question = await manager.create(Question, {cost: newQuestionCost, round});
                await manager.save(question);
            }

            return round;
        });
    }
}
