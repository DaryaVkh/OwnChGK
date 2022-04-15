import {Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn} from 'typeorm';
import {Round} from "./Round";

@Entity('questions')
export class Question extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', {name: 'question_id'})
    id: string;

    @Column()
    number: number;

    @Column({
        nullable: true
    })
    text: string;

    @Column()
    cost: number

    @ManyToOne(() => Round, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({
        name: 'round_id',
    })
    round: Round;
}