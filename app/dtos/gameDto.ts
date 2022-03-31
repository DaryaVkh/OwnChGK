import {Game} from "../db/entities/Game";
import {bigGames} from "../socket";
import {Team} from "../db/entities/Team";

export class GameDto {
    public readonly name: string;
    public readonly id: string;
    public readonly isStarted: boolean;
    public readonly teams: string[];
    public readonly roundCount: number;
    public readonly questionCount: number;

    constructor(game: Game, name: string, teams: Team[]) {
        this.name = name;
        this.id = game.id.toString();
        this.isStarted = !!bigGames[this.id];
        this.teams = teams?.map(team => team.name); // TODO: мейби нужно будет на TeamDto
        this.roundCount = game.rounds?.length ?? 0;
        this.questionCount = this.roundCount !== 0 ? game.rounds[0].questions.length : 0;
    }
}