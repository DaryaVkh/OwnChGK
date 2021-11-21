import {Entity, Column, PrimaryGeneratedColumn, BaseEntity, JoinColumn, ManyToOne} from 'typeorm';
import {Game} from './Game';

@Entity('rounds')
export class Round extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'round_id'})
    id: number;

    @Column()
    number: number;

    @Column({
        name: 'questions_number'
    })
    questionsNumber: number

    @Column({
        name: 'questions_cost'
    })
    questionsCost: number

    @Column({
        name: 'questions_time'
    })
    questionsTime: number

    @ManyToOne(() => Game, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({
        name: 'game_id',
    })
    game: Game;
}