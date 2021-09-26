import {AnswerAndAppeal} from "./AnswerAndAppeal";

export class Team {
    public readonly name: string;
    public readonly id: number;
    private readonly answers: AnswerAndAppeal[];

    constructor(name: string) {
        this.name = name
        this.id = Math.round(Math.random() * 1000000);
        this.answers = [];
    }

    addAnswer(answer: AnswerAndAppeal): void {
        this.answers.push(answer);
    }

    getTotalScore(): number {
        let sum = 0;
        for (const answer of this.answers) {
            sum += answer.score;
        }
        return sum;
    }

    getAnswer(roundNumber: number, questionNumber: number): AnswerAndAppeal | undefined {
        return this.answers.find((value, index, obj) =>
            value.roundNumber === roundNumber && value.questionNumber === questionNumber);
    }

    getScoreTable(): number[][] {
        const scoreTable = [];
        for (let answer of this.answers)
        {
            if (answer.roundNumber > scoreTable.length) {
                scoreTable.push([answer.score]);
            }
            else
                scoreTable[scoreTable.length-1].push(answer.score);
        }
        return scoreTable;
    }
}