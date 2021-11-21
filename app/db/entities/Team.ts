import {Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToOne, JoinColumn, ManyToMany} from 'typeorm';
import {User} from './User';
import {Game} from './Game';

@Entity('teams')
export class Team extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'team_id'})
    id: number;

    @Column({
        unique: true
    })
    name: string;

    @OneToOne(
        () => User,
        user => user.team,
        {
            nullable: false,
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        })
    @JoinColumn({
        name: 'captain_id',
    })
    captain: User;

    @ManyToMany(
        () => Game,
    )
    games: Game[];
}