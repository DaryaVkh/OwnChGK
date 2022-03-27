import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import {Round} from './Round';
import {BigGame} from "./BigGame";

export enum GameStatus {
    NOT_STARTED = 'not_started',
    STARTED = 'started',
    FINISHED = 'finished'
}

export enum GameType {
    CHGK = 'chgk',
    MATRIX = 'matrix'
}

@Entity('games')
export class Game extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', {name: 'game_id'})
    id: string;

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.NOT_STARTED
    })
    status: string;

    @Column({
        type: 'enum',
        enum: GameType,
        default: GameType.CHGK
    })
    type: string;

    @OneToMany(
        () => Round,
        round => round.game
    )
    rounds: Round[];

    @ManyToOne(() => BigGame, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({
        name: 'bigGame_id',
    })
    bigGame: BigGame
}