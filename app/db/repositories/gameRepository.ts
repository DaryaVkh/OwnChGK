import {EntityManager, EntityRepository, Repository} from 'typeorm';
import {Game} from '../entities/Game';
import {Round} from "../entities/Round";
import {Question} from "../entities/Questions";

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
    async createRoundsWithQuestions(roundCount: number, questionCount: number, manager: EntityManager,
                                    game: Game, questionTime: number, questionCost: number) {
        for (let i = 1; i <= roundCount; i++) {
            const round = await manager.create(Round, {number: i, game, questionTime});
            await manager.save(round);

            for (let j = 1; j <= questionCount; j++) {
                const question = await manager.create(Question, {cost: questionCost, round});
                await manager.save(question);
            }
        }
    }
}
