import {Game} from "../logic/Game";
import {bigGames} from "../socket";

export class ScoreTableDto {
    public readonly gameId: string;
    public readonly isIntrigue: boolean;
    public readonly roundsCount: number;
    public readonly questionsCount: number;
    public readonly totalScoreForAllTeams: { name: string, scoreTable: number[][] };

    constructor(game: Game, teamId: string = undefined) {
        this.gameId = game.id.toString();
        this.isIntrigue = bigGames[this.gameId].CurrentGame.isIntrigue;
        this.roundsCount = bigGames[this.gameId].CurrentGame.rounds.length;
        this.questionsCount = bigGames[this.gameId].CurrentGame.rounds[0].questionsCount;
        this.totalScoreForAllTeams = !teamId ? bigGames[this.gameId].CurrentGame.getScoreTable() : bigGames[this.gameId].CurrentGame.getScoreTableForTeam(teamId);
    }
}