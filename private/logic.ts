import {Team} from "./Team";
import {Question} from "./Question";


export class Round {
    public readonly number: number;
    public readonly questions: Question[]; // TODO: public?
    public readonly questionsCount: number;
    public readonly questionTime: number;
    public readonly questionCost: number;

    constructor(number: number, questionsCount: number, questionTime: number, questionCost: number) {
        this.questionCost = questionCost;
        this.questionsCount = questionsCount;
        this.questionTime = questionTime;
        this.number = number;
        this.questions = this.createQuestions();
    }

    createQuestions(): Question[] {
        const result = [];
        for (let i = 1; i <= this.questionsCount; i++) {
            result.push(new Question(this.questionCost, this.number, i, this.questionTime));
        }
        return result;
    }
}

export class Game {
    public readonly id: number;
    public readonly name: string;
    public readonly rounds: Round[]; // TODO: public?
    public readonly teams: { [name: number]: Team }; // TODO: public?

    constructor(name: string) {
        this.id = Math.round(Math.random() * 1000000)
        this.name = name;
        this.rounds = [];
        this.teams = {};
    }

    addTeam(team: Team): void {
        this.teams[team.id] = team;
    }

    addRound(round: Round): void {
        this.rounds.push(round);
    }

    getScoreTable(): { [name: string]: number[][] } {
        const table = {};
        for (let teamId in this.teams)
        {
            table[this.teams[teamId].name] = this.teams[teamId].getScoreTable();
        }
        return table;
    }
}
