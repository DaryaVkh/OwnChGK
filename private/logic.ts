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
        this.questions = this.createQuestions();
        this.number = number;
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
}

let team = new Team("cool");
let otherTeam = new Team("not cool");
let q = new Question(1, 1, 1, 50);
q.giveAnswer(team, "la");
q.giveAnswer(otherTeam, "la");
q.acceptAnswers("la");
let q2 = new Question(1, 1, 2, 50);
q2.giveAnswer(team, "2");
q2.giveAnswer(otherTeam, "1");
q2.acceptAnswers("2");
let q3 = new Question(1, 2, 1, 50);
q3.giveAnswer(team, "2");
q3.giveAnswer(otherTeam, "3");
q3.acceptAnswers("3");
let q4 = new Question(1, 2, 2, 50);
q4.giveAnswer(team, "4");
q4.giveAnswer(otherTeam, "4");
q4.acceptAnswers("6");
let score = team.getScoreTable();
let otherScore = otherTeam.getScoreTable();
console.log(score);
console.log(otherScore);
q4.giveAppeal(team.id, "you are wrong!");
q4.acceptAppeal(team, "yes");

score = team.getScoreTable();
otherScore = otherTeam.getScoreTable();
console.log(score);
console.log(otherScore);