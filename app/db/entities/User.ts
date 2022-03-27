import {Entity, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Person} from './Person';
import {Team} from './Team';

@Entity('users')
export class User extends Person {
    @PrimaryGeneratedColumn('uuid', {name: 'user_id'})
    id: string;

    @OneToOne(
        () => Team,
        team => team.captain,
    )
    team: Team;
}