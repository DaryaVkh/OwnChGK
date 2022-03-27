import {Team} from './db/entities/Team';
import {BigGame} from "./db/entities/BigGame";

export class BigGameDTO {
    public readonly name: string;
    public readonly id: string;

    constructor(game: BigGame) {
        this.name = game.name;
        this.id = game.id.toString();
    }
}

export class TeamDTO {
    public readonly name: string;
    public readonly id: string;

    constructor(team: Team) {
        this.name = team.name;
        this.id = team.id.toString();
    }
}