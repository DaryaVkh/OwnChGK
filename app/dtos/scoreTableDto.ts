import {Game} from "../logic/Game";
import {games} from "../socket";

export class ScoreTableDto {
    public readonly gameId: string;
    public readonly isIntrigue: boolean;
    public readonly roundsCount: number;
    public readonly questionsCount: number;
    public readonly totalScoreForAllTeams: { name: string, scoreTable: number[][] };

    constructor(game: Game, teamId: number = undefined) {
        this.gameId = game.id.toString();
        this.isIntrigue = games[this.gameId].isIntrigue;
        this.roundsCount = games[this.gameId].rounds.length;
        this.questionsCount = games[this.gameId].rounds[0].questionsCount;
        this.totalScoreForAllTeams = !teamId ? games[this.gameId].getScoreTable() : games[this.gameId].getScoreTableForTeam(teamId);
    }
}