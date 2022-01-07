import {Answer, Appeal} from './AnswerAndAppeal';

export class Team {
    public readonly name: string;
    public id: number;
    public readonly answers: Answer[][]; // TODO: public?

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
            this.answers[answer.roundNumber].push(new Answer(this.id, answer.roundNumber, answer.questionNumber, ''));
            //заглушка (для 0 элементов или если не ответили на вопрос)
        }

        if (this.answers[answer.roundNumber].length === answer.questionNumber) {
            this.answers[answer.roundNumber].push(answer);
        } else {
            this.answers[answer.roundNumber][answer.questionNumber] = answer;
        }
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
            for (let i=1; i<answers.length; i++) {
                if (answers[i].roundNumber > scoreTable.length) {
                    scoreTable.push({roundNumber: [answers[i].score]});
                } else {
                    console.log(scoreTable[scoreTable.length - 1]);
                    scoreTable[scoreTable.length - 1].push(answers[i].score);
                }
            }
        }
        return scoreTable;
    }
}