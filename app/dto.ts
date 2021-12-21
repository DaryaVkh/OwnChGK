import {Game} from './db/entities/Game';
import {Team} from './db/entities/Team';

export class GameDTO {
    public readonly name: string;
    public readonly id: string;

    constructor(game: Game) {
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