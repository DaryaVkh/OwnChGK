import {Entity, Column, BaseEntity} from 'typeorm';

@Entity()
export abstract class Person extends BaseEntity {
    @Column({
        unique: true
    })
    email: string;

    @Column()
    password: string;

    @Column({
        nullable: true
    })
    name: string;
}