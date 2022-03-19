import {Team} from "./Team";
import {Answer, Appeal, Status} from './AnswerAndAppeal';

export class Question {
    public readonly cost: number;
    public readonly number: number;
    public readonly time: number;
    public readonly roundNumber: number;
    public readonly answers: Answer[];
    public readonly appeals: Appeal[];

    constructor(cost: number, roundNumber: number, number: number, time: number) {
        this.cost = cost;
        this.roundNumber = roundNumber;
        this.number = number;
        this.time = time;
        this.answers = [];
        this.appeals = [];
    }

    giveAnswer(team: Team, text: string): void {
        const answer = new Answer(team.id, this.roundNumber, this.number, text);
        const index = this.answers.map(answer => answer.teamNumber).indexOf(team.id);
        if (index !== -1) {
            this.answers[index] = answer;
        } else {
            this.answers.push(answer);
        }
        team.addAnswer(answer);
    }

    giveAppeal(teamNumber: number, text: string, wrongAnswer:string): void {
        const appeal = new Appeal(teamNumber, this.roundNumber, this.number, text, wrongAnswer);
        this.appeals.push(appeal);
        const index = this.answers.map(ans => ans.teamNumber).indexOf(teamNumber);
        this.answers[index].onAppeal();
    }

    acceptAnswers(rightAnswer: string): void {
        for (let answer of this.answers) {
            if (answer.text === rightAnswer) {
                answer.accept(this.cost);
            }
        }
    }

    rejectAnswers(wrongAnswer: string, isMatrixType=false): void {
        for (let answer of this.answers) {
            if (answer.text === wrongAnswer) {
                isMatrixType ? answer.reject(this.cost) : answer.reject(0);
            }
        }
    }

    acceptAppeal(answer: string, comment: string = ""): void {
        const appeals = this.appeals.filter((value, index, obj) =>
            value.wrongAnswer === answer);

        for (const appeal of appeals) {
            appeal.accept(comment);
        }

        this.acceptAnswers(answer);
    }

    rejectAppeal(answer: string, comment: string = ""): void {
        const appeals = this.appeals.filter((value, index, obj) =>
            value.wrongAnswer === answer);
        for (const appeal of appeals) {
            appeal.reject(comment);
        }

        this.rejectAnswers(answer);
    }
}