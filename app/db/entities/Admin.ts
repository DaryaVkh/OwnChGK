import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import {Person} from './Person';
import {Game} from './Game';

export enum AdminRoles {
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin'
}

@Entity('admins')
export class Admin extends Person {
    @PrimaryGeneratedColumn({name: 'admin_id'})
    id: number;

    @Column({
        type: 'enum',
        enum: AdminRoles,
        default: AdminRoles.ADMIN
    })
    role: string;

    @OneToMany(
        () => Game,
        game => game.admin
    )
    games: Game[];
}