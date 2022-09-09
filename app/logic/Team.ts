import {Answer, Status} from './AnswerAndAppeal';

export class Team {
    public readonly name: string;
    public id: string;
    private answers: Answer[];

    constructor(name: string, id: string) {
        this.name = name
        this.id = id;
        this.answers = [];
    }

    addAnswer(answer: Answer): void {
        this.answers = this.answers.filter((ans:Answer) => ans.roundNumber != answer.roundNumber ||
                                        ans.questionNumber != answer.questionNumber);
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
}