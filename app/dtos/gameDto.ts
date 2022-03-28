import {Game} from "../db/entities/Game";
import {games} from "../socket";

export class GameDto {
    public readonly name: string;
    public readonly id: string;
    public readonly isStarted: boolean;
    public readonly teams: string[];
    public readonly roundCount: number;
    public readonly questionCount: number;

    constructor(game: Game) {
        this.name = game.name;
        this.id = game.id.toString();
        this.isStarted = !!games[this.id];
        this.teams = game.teams?.map(team => team.name); // TODO: мейби нужно будет на TeamDto
        this.roundCount = game.rounds?.length ?? 0;
        this.questionCount = this.roundCount !== 0 ? game.rounds[0].questionCount : 0;
    }
}