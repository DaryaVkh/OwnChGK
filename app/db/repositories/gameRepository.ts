import {EntityManager, EntityRepository, Repository} from 'typeorm';
import {Game, GameType} from '../entities/Game';
import {Round} from "../entities/Round";
import {Question} from "../entities/Questions";

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
    async createRoundsWithQuestions(roundCount: number, questionCount: number, game: Game,
                                    questionTime: number, questionCost: number, roundNames?: string[], questionsText?: Record<string, string[]>) {
        if (roundNames && roundCount !== roundNames.length) {
            throw new Error("roundNames.length !== roundCount");
        }

        for (let i = 1; i <= roundCount; i++) {
            const round = await this.manager.create(Round, {number: i, game, questionTime, name: roundNames ? roundNames[i - 1] : null});
            await this.manager.save(round);

            for (let j = 1; j <= questionCount; j++) {
                const question = await this.manager.create(Question, {number: j, cost: game.type === GameType.CHGK ? j * questionCost : questionCost, round, text: Object.keys(questionsText).length !== 0 ? questionsText['Round '+i][j-1] : null});
                await this.manager.save(question);
            }
        }
    }
}
