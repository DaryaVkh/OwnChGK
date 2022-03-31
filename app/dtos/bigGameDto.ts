import {BigGame} from "../db/entities/BigGame";

export class BigGameDto {
    public readonly name: string;
    public readonly id: string;

    constructor(game: BigGame) {
        this.name = game.name;
        this.id = game.id.toString();
    }
}
