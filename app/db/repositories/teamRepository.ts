import {EntityRepository, Repository} from 'typeorm';
import {Team} from '../entities/Team';
import {User} from '../entities/User';

@EntityRepository(Team)
export class TeamRepository extends Repository<Team> {
    findByName(name: string) {
        return this.findOne({name}, {relations: ['captain']});
    }

    findTeamsWithoutUser() {
        return this.find({relations: ['captain']})
            .then(teams => teams.filter(team => team.captain === null))
    }

    insertByNameAndUserEmail(name: string, userEmail: string) {
        return this.manager.transaction(manager => {
            return manager.findOne(User, {'email': userEmail})
                .then(user => manager.insert(Team, {name, 'captain': user}));
        });
    }

    deleteByName(name: string) {
        return this.delete({name});
    }

    updateByParams(name: string, newName: string, captainEmail: string) {
        return this.manager.transaction(manager => {
            return manager.findOne(Team, {'name': name})
                .then(team => manager.findOne(User, {'email': captainEmail})
                    .then(user => {
                        team.name = newName;
                        team.captain = user === undefined ? null : user;
                        return manager.save(Team, team);
                    }));
        });
    }

    updateByNames(name: string, newName: string) {
        return this.update({name}, {'name': newName});
    }

    updateByNameAndNewUserEmail(name: string, newUserEmail: string) {
        return this.manager.transaction(manager => {
            return manager.findOne(User, {'email': newUserEmail})
                .then(user => manager.update(Team, {name}, {'captain': user}));
        });
    }

    updateEmptyTeamByNameAndUserEmail(name: string, userId: string) {
        return this.manager.transaction(manager =>
            manager.findOne(Team, {name}, {relations: ['captain']})
                .then(team => {
                        if (team.captain !== null) {
                            throw new Error('Команда уже с капитаном');
                        }

                        return manager.findOne(User, userId)
                            .then(user => {
                                team.captain = user;
                                return manager.save(Team, team);
                            })
                    }
                )
        );
    }
}
