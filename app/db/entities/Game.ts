import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    JoinColumn,
    JoinTable,
    ManyToOne,
    OneToMany,
    ManyToMany
} from 'typeorm';
import {Admin} from './Admin';
import {Round} from './Round';
import {Team} from './Team';

export enum GameStatus {
    NOT_STARTED = 'not_started',
    STARTED = 'started',
    FINISHED = 'finished'
}

@Entity('games')
export class Game extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'game_id'})
    id: number;

    @Column({
        unique: true
    })
    name: string;

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.NOT_STARTED
    })
    status: string;

    @ManyToOne(() => Admin, {
        nullable: false,
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({
        name: 'admin_id',
    })
    admin: Admin;

    @OneToMany(
        () => Round,
        round => round.game
    )
    rounds: Round[];

    @ManyToMany(
        () => Team,
        {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    )
    @JoinTable({
        name: 'game_team_links',
        joinColumn: {
            name: 'game_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'team_id',
            referencedColumnName: 'id'
        }
    })
    teams: Team[];
}