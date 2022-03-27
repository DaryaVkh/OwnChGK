import {EntityRepository, Repository} from 'typeorm';
import {User} from '../entities/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findById(userId: string) {
        return this.findOne(userId, {relations: ['team']});
    }
    findByEmail(email: string) {
        return this.findOne({email}, {relations: ['team']});
    }

    findUsersWithoutTeam() {
        return this.find({relations: ['team']})
            .then(users => users.filter(user => user.team === null))
    }

    insertByEmailAndPassword(email: string, password: string) {
        return this.manager.transaction(async manager => {
            const user = await manager.create(User, {email, password});

            return manager.save(user);
        })
    }

    updateByEmailAndPassword(email: string, password: string) {
        return this.manager.transaction(async manager => {
            const user = await manager.findOne(User, {email});
            user.password = password;

            return manager.save(user);
        })
    }
}
