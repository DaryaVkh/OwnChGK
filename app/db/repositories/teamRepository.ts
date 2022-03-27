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
        return this.manager.transaction(async manager => {
            const captain = await manager.findOne(User, {email: userEmail});
            const team = await manager.create(Team, {name, captain});

            return manager.save(team);
        });
    }

    deleteByName(name: string) {
        return this.delete({name});
    }

    updateByParams(teamId: string, newName: string, captainEmail: string) {
        return this.manager.transaction(async manager => {
            const team = await manager.findOne(Team, teamId);
            const captain = await manager.findOne(User, {email: captainEmail});
            team.name = newName;
            team.captain = captain ?? null;

            return await manager.save(team);
        });
    }

    updateByNames(name: string, newName: string) {
        return this.manager.transaction(async manager => {
            const team = await manager.findOne(Team, {name});
            team.name = newName;

            return manager.save(team);
        })
    }

    updateByNameAndNewUserEmail(name: string, newUserEmail: string) {
        return this.manager.transaction(async manager => {
            const captain = await manager.findOne(User, {email: newUserEmail});
            const team = await manager.findOne(Team, {name});
            team.captain = captain;

            return manager.save(team);
        });
    }

    updateEmptyTeamByIdAndUserEmail(teamId: string, userId: string) {
        return this.manager.transaction(async manager => {
            const team = await manager.findOne(Team, teamId, {relations: ['captain']});
            if (team.captain !== null) {
                throw new Error('Команда уже с капитаном');
            }

            team.captain = await manager.findOne(User, userId);

            return manager.save(team);
        });
    }
}
