import {EntityRepository, Repository} from 'typeorm';
import {Admin} from '../entities/Admin';

@EntityRepository(Admin)
export class AdminRepository extends Repository<Admin> {
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
