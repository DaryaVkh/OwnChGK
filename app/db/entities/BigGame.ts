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
import {Game} from "./Game";
import {Admin} from "./Admin";
import {Team} from "./Team";

@Entity('bigGames')
export class BigGame extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', {name: 'bigGame_id'})
    id: string;

    @Column({
        unique: true
    })
    name: string;

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
        name: 'bigGame_team_links',
        joinColumn: {
            name: 'bigGame_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'team_id',
            referencedColumnName: 'id'
        }
    })
    teams: Team[];
}