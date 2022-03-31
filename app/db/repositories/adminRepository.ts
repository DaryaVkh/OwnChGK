import {EntityRepository, Repository} from 'typeorm';
import {Admin} from '../entities/Admin';

@EntityRepository(Admin)
export class AdminRepository extends Repository<Admin> {
    findByEmail(email: string) {
        return this.findOne({email});
    }

    insertByEmailAndPassword(email: string, password: string, name: string = null) {
        return this.manager.transaction(async manager => {
            const admin = await manager.create(Admin, {email, password, name: name ?? null});

            return manager.save(admin);
        });
    }

    updateByEmailAndPassword(email: string, password: string) {
        return this.manager.transaction(async manager => {
            const admin = await manager.findOne(Admin, {email});
            admin.password = password;

            return manager.save(admin);
        });
    }
}
