import {Answer, Appeal} from './AnswerAndAppeal';

export class Team {
    public readonly name: string;
    public id: number;
    private answers: Answer[]; // TODO: public?

    constructor(name: string, id: number) {
        this.name = name
        this.id = id;
        this.answers = [];
    }

    addAnswer(answer: Answer): void {
        console.log('current answer', answer);
        this.answers = this.answers.filter((ans:Answer) => ans.roundNumber != answer.roundNumber ||
                                        ans.questionNumber != answer.questionNumber);
        console.log('this answers', this.answers);
        this.answers.push(answer);
    }

    getAnswers(): Answer[] {
        return this.answers;
    }

    getTotalScore(): number {
        let sum = 0;
        for (const answer of this.answers) {
                sum += answer.score;
            }
        return sum;
    }

    getAnswer(roundNumber: number, questionNumber: number): Answer | undefined {
        return this.answers.find((ans:Answer) => ans.roundNumber == roundNumber &&
            ans.questionNumber == questionNumber);
    }

    // getScoreTable(): number[][] {
    //     const scoreTable = [];
    //     for (let answer of this.answers) {
    //         if (answers[i].roundNumber > scoreTable.length) {
    //                 scoreTable.push({roundNumber: [answers[i].score]});
    //             } else {
    //                 console.log(scoreTable[scoreTable.length - 1]);
    //                 scoreTable[scoreTable.length - 1].push(answers[i].score);
    //             }
    //     }
    //     return scoreTable;
    // }
}