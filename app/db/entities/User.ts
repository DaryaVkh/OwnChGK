import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Person} from './Person';
import {Team} from './Team';

@Entity('users')
export class User extends Person {
    @PrimaryGeneratedColumn({name: 'user_id'})
    id: number;

    @OneToOne(
        () => Team,
        team => team.captain,
    )
    team: Team;
}