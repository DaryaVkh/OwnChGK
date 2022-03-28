import {Round} from "../db/entities/Round";

export class RoundDto {
    public readonly number: number;
    public readonly questionCount: number;
    public readonly questionCost: number;
    public readonly questionTime: number;

    constructor(round: Round) {
        this.number = round.number;
        this.questionCount = round.questionCount;
        this.questionCost = round.questionCost;
        this.questionTime = round.questionTime;
    }
}