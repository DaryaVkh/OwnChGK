import {Team} from "./Team";
import {Answer, Appeal, Status} from './AnswerAndAppeal';

export class Question {
    public readonly cost: number;
    public readonly number: number;
    public readonly time: number;
    public readonly roundNumber: number;
    public readonly answers: Answer[]; // TODO: public? Сейчас непонятно, как получить ответы
    public readonly appeals: Appeal[]; // TODO: public? Сейчас непонятно, как получить апелляции

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

    giveAppeal(teamNumber: number, text: string): void {
        const appeal = new Appeal(teamNumber, this.roundNumber, this.number, text);
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

    rejectAnswers(wrongAnswer: string): void {
        for (let answer of this.answers) {
            if (answer.text === wrongAnswer) {
                answer.reject();
            }
        }
    }

    acceptAppeal(teamId: number, comment: string = ""): void {
        console.log('appeals:', this.appeals);
        const appeal = this.appeals.find((value, index, obj) =>
            value.teamNumber === teamId);
        console.log('appeal:', appeal);

        if (appeal !== undefined) {
            appeal.accept(comment);
            console.log('newAppeal:', appeal);
        }

        const answer = this.answers.find((value, index, obj) =>
            value.teamNumber === teamId);

        console.log('answers:', this.answers);
        console.log('answer:', answer);
        if (answer !== undefined) {
            this.acceptAnswers(answer.text);
        }
    }

    rejectAppeal(teamId: number, comment: string = ""): void {
        const appeal = this.appeals.find((value, index, obj) =>
            value.teamNumber === teamId);

        if (appeal !== undefined) {
            appeal.reject(comment);
        }
    }
}