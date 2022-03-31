import {Round} from "../db/entities/Round";

export class RoundDto {
    public readonly number: number;
    public readonly questionCount: number;
    public readonly questionCost: number;
    public readonly questionTime: number;

    constructor(round: Round) {
        this.number = round.number;
        this.questionCount = round.questions?.length ?? 0;
        this.questionCost = round.questions[0]?.cost ?? 0;
        this.questionTime = round.questionTime;
    }
}