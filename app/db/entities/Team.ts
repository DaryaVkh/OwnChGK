import {Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToOne, JoinColumn, ManyToMany} from 'typeorm';
import {User} from './User';
import {BigGame} from "./BigGame";

export class Participant {
    name: string;
    email: string;

    constructor(email?: string, name?: string) {
        this.email = email;
        this.name = name;
    }
}

@Entity('teams')
export class Team extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', {name: 'team_id'})
    id: string;

    @Column({
        unique: true
    })
    name: string;

    @OneToOne(
        () => User,
        user => user.team,
        {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        })
    @JoinColumn({
        name: 'captain_id'
    })
    captain: User;

    @ManyToMany(
        () => BigGame,
    )
    bigGames: BigGame[];

    @Column("json", {
        nullable: true
    })
    participants: Participant[]
}