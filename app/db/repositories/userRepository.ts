import {EntityRepository, Repository} from 'typeorm';
import {User} from '../entities/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findByEmail(email: string) {
        return this.findOne({email});
    }

    insertByEmailAndPassword(email: string, password: string) {
        return this.insert({email, password});
    }

    updateByEmailAndPassword(email: string, password: string) {
        return this.update({email}, {password});
    }
}
