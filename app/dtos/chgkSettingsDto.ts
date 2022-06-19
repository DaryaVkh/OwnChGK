import {Game} from "../db/entities/Game";

export class ChgkSettingsDto {
    public readonly roundCount: number;
    public readonly questionCount: number;
    public readonly questions: Record<number, string[]>;

    constructor(game: Game) {
        this.roundCount = game.rounds?.length ?? 0;
        this.questionCount = this.roundCount !== 0 ? game.rounds[0].questions.length : 0;

        const rounds = game.rounds.sort((a, b) => a.number > b.number ? 1 : -1);
        const questions: Record<number, string[]> = {};
        for (let i = 0; i < this.roundCount; i++) {
            questions[i + 1] = rounds[i].questions.sort((a, b) => a.number > b.number ? 1 : -1).map(q => q.text);
        }
        this.questions = questions;
    }
}