import {Game} from "../db/entities/Game";

export class ChgkSettingsDto {
    public readonly roundCount: number;
    public readonly questionCount: number;

    constructor(game: Game) {
        this.roundCount = game.rounds?.length ?? 0;
        this.questionCount = this.roundCount !== 0 ? game.rounds[0].questions.length : 0;
    }
}