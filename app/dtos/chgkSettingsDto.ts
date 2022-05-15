import {Game} from "../db/entities/Game";

export class ChgkSettingsDto {
    public readonly roundCount: number;
    public readonly questionCount: number;
    public readonly questions: Record<string, string[]>;

    constructor(game: Game) {
        this.roundCount = game.rounds?.length ?? 0;
        this.questionCount = this.roundCount !== 0 ? game.rounds[0].questions.length : 0;

        const questions: Record<string, string[]> = {};
        for (let i = 0; i < this.roundCount; i++) {
            questions['Round ' + (i+1)] = game.rounds[i].questions.map(q => q.text);
        }
        this.questions = questions;
    }
}