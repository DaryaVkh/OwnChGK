import {EntityRepository, In, Repository, getCustomRepository} from 'typeorm';
import {Game} from '../entities/Game';
import {RoundRepository} from './roundRepository';
import {Team} from '../entities/Team';
import {Admin} from '../entities/Admin';
import {User} from '../entities/User';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
    findByName(name: string) {
        return this.findOne({name});
    }

    insertByParams(name: string,
                   adminEmail: string,
                   roundCount: number,
                   questionCount: number,
                   questionCost: number,
                   questionTime: number,
                   teams: string[]) {
        return this.manager.transaction(manager => manager.findOne(Admin, {'email': adminEmail})
            .then(admin => manager.find(Team, {'name': In(teams)})
                .then(teams => manager.insert(Game, {name, admin, teams})
                    .then(() => {
                        const roundRepository = getCustomRepository(RoundRepository);
                        for (let i = 1; i <= questionCount; i++) {
                            roundRepository.insertByParams(i, name, questionCount, questionCost, questionTime);
                        }
                    }))));
    }

    deleteByName(name: string) {
        return this.delete({name});
    }

    updateByNames(name: string, newName: string) {
        return this.update({name}, {'name': newName});
    }

    updateByNameAndAdminEmail(name: string, newAdminEmail: string) {
        return this.manager.transaction(manager => {
            return manager.findOne(Admin, {'email': newAdminEmail})
                .then(admin => manager.update(Game, {name}, {'admin': admin}));
        });
    }

    updateByNameAndStatus(name: string, newStatus: string) {
        return this.update({name}, {'status': newStatus});
    }
}
