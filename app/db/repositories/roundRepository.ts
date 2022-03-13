import {EntityRepository, Repository} from 'typeorm';
import {Round} from '../entities/Round';
import {Game} from '../entities/Game';

@EntityRepository(Round)
export class RoundRepository extends Repository<Round> {
    findByGameName(gameName: string) {
        return this.manager.transaction(manager => {
            return manager.findOne(Game, {'name': gameName})
                .then(game => manager.find(Round, {game}));
        });
    }

    insertByParams(number: number,
                   gameName: string,
                   questionCount: number,
                   questionCost: number,
                   questionTime: number) {
        return this.manager.transaction(manager => {
            return manager.findOne(Game, {'name': gameName})
                .then(game => manager.insert(Round, {number, game, questionCount, questionCost, questionTime}));
        });
    }

    deleteByGameNameAndNumber(gameId: string, number: number) {
        return this.manager.transaction(manager => {
            return manager.findOne(Game, gameId)
                .then(game => manager.delete(Round, {game, number}));
        });
    }

    updateByParams(number: number,
                   gameId: string,
                   newQuestionNumber: number,
                   newQuestionCost: number,
                   newQuestionTime: number) {
        return this.manager.transaction(manager => {
            return manager.findOne(Game, gameId)
                .then(game => manager.update(Round,
                    {game, number},
                    {
                        'questionCount': newQuestionNumber,
                        'questionCost': newQuestionCost,
                        'questionTime': newQuestionTime
                    }));
        });
    }
}
