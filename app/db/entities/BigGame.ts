import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    OneToMany,
    ManyToOne,
    JoinColumn,
    ManyToMany, JoinTable
} from 'typeorm';
import {Game, GameStatus} from "./Game";
import {Admin} from "./Admin";
import {Team} from "./Team";

@Entity('big_games')
export class BigGame extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', {name: 'big_game_id'})
    id: string;

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

    @OneToMany(
        () => Game,
        game => game.bigGame
    )
    games: Game[];

    @ManyToOne(() => Admin, {
        nullable: false,
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({
        name: 'admin_id',
    })
    admin: Admin;

    @ManyToMany(
        () => Team,
        {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    )
    @JoinTable({
        name: 'big_game_team_links',
        joinColumn: {
            name: 'big_game_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'team_id',
            referencedColumnName: 'id'
        }
    })
    teams: Team[];
}