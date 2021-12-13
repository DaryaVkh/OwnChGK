import {Answer, Appeal} from "./AnswerAndAppeal";

export class Team {
    public readonly name: string;
    public id: number;
    private readonly answers: Answer[][];

    constructor(name: string, id: number) {
        this.name = name
        this.id = id;
        this.answers = [[]];
    }

    addAnswer(answer: Answer): void {
        if (this.answers.length === answer.roundNumber) {
            this.answers.push([]);
        }
        if (this.answers[answer.roundNumber].length < answer.questionNumber) {
            this.answers[answer.roundNumber].push(new Answer(this.id, answer.roundNumber, answer.questionNumber, ""));
            //заглушка (для 0 элементов или если не ответили на вопрос)
        }
        if (this.answers[answer.roundNumber].length === answer.questionNumber){
            this.answers[answer.roundNumber].push(answer);
        }
        else this.answers[answer.roundNumber][answer.questionNumber] = answer;
    }

    getTotalScore(): number {
        let sum = 0;
        for (const answers of this.answers) {
            for (const answer of answers) {
                sum += answer.score;
            }
        }
        return sum;
    }

    getAnswer(roundNumber: number, questionNumber: number): Answer | undefined {
        return this.answers[roundNumber][questionNumber];
    }

    getScoreTable(): number[][] {
        const scoreTable = [];
        for (let answers of this.answers) {
            for (let answer of answers) {
                if (answer.roundNumber > scoreTable.length) {
                    scoreTable.push([answer.score]);
                } else
                    scoreTable[scoreTable.length - 1].push(answer.score);
            }
        }
        return scoreTable;
    }
}