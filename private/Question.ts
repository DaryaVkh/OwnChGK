import {Team} from "./Team";
import {AnswerAndAppeal, Appeal} from "./AnswerAndAppeal";

export class Question {
    public readonly cost: number;
    public readonly number: number;
    public readonly time: number;
    public readonly roundNumber: number;
    private readonly answers: AnswerAndAppeal[]; // TODO: public? Сейчас непонятно, как получить ответы
    private readonly appeals: Appeal[]; // TODO: public? Сейчас непонятно, как получить апелляции

    constructor(cost: number, roundNumber: number, number: number, time: number) {
        this.cost = cost;
        this.roundNumber = roundNumber;
        this.number = number;
        this.time = time;
        this.answers = [];
        this.appeals = [];
    }

    giveAnswer(team: Team, text: string): void {
        const answer = new AnswerAndAppeal(team.id, this.roundNumber, this.number, text);
        this.answers.push(answer);
        team.addAnswer(answer);
    }

    giveAppeal(teamNumber: number, text: string): void {
        const appeal = new Appeal(teamNumber, this.roundNumber, this.number, text);
        this.appeals.push(appeal);
    }

    acceptAnswers(rightAnswer: string): void {
        for (let answer of this.answers) {
            if (answer.text === rightAnswer) {
                answer.accept(this.cost);
            }
        }
    }

    acceptAppeal(team: Team, comment: string): void {
        const appeal = this.appeals.find((value, index, obj) =>
            value.teamNumber === team.id);

        if (appeal !== undefined) {
            appeal.accept(comment);
        }

        const answer = this.answers.find((value, index, obj) =>
            value.teamNumber === team.id);

        if (answer !== undefined) {
            this.acceptAnswers(answer.text);
        }
    }
}