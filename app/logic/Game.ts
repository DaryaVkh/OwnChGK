import {Team} from './Team';
import {Question} from './Question';
import {seconds70PerQuestion} from '../socket';


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

export enum GameStatus {
    IsOnBreak,
    Start
}

export class Game {
    public readonly id: number;
    public readonly name: string;
    public readonly rounds: Round[];
    public readonly teams: { [number: number]: Team };
    public status: GameStatus;
    public breakTime: number;
    private interval: any;
    public currentQuestion: [number, number];
    public isTimerStart: boolean;
    public isIntrigue: boolean;

    public timer: any;
    public leftTime: number;
    public maxTime: number;
    public timeIsOnPause: boolean;

    constructor(name: string) {
        this.id = Math.round(Math.random() * 1000000)
        this.name = name;
        this.rounds = [];
        this.teams = {};
        this.status = GameStatus.Start;
        this.breakTime = 0;
        this.currentQuestion = [1, 1];
        this.isTimerStart = false;
        this.leftTime = seconds70PerQuestion;
        this.timeIsOnPause = false;
        this.maxTime = seconds70PerQuestion;
    }

    startBreak(time: number): void {
        this.status = GameStatus.IsOnBreak;
        this.breakTime = time;
        this.interval = setInterval(() => {
            if (this.breakTime === 0) {
                this.stopBreak();
            } else {
                this.breakTime -= 1;
            }
        }, 1000, this);
    }

    stopBreak(): void {
        clearInterval(this.interval);
        this.status = GameStatus.Start;
        this.breakTime = 0;
    }

    addTeam(team: Team): void {
        this.teams[team.id] = team;
    }

    addRound(round: Round): void {
        this.rounds.push(round);
    }

    getScoreTable(): { name: string, scoreTable: number[][] } {
        let table = {};
        const roundsCount = this.rounds.length;
        const questionsCount = this.rounds[0].questions.length;

        for (let teamId in this.teams) {
            table[this.teams[teamId].name] = new Array(roundsCount);
            for (let round = 0; round < roundsCount; round++) {
                table[this.teams[teamId].name][round] = new Array(questionsCount).fill(0);
            }
            const teamAnswers = this.teams[teamId].getAnswers();
            for (let answer of teamAnswers) {
                table[this.teams[teamId].name][answer.roundNumber - 1][answer.questionNumber - 1] = answer.score;
            }
        }
        // @ts-ignore
        return table;
    }

    getScoreTableForTeam(teamId: number): { name: string, scoreTable: number[][] } {
        let table = {};
        const roundsCount = this.rounds.length;
        const questionsCount = this.rounds[0].questions.length;

        table[this.teams[teamId].name] = new Array(roundsCount);
        for (let round = 0; round < roundsCount; round++) {
            table[this.teams[teamId].name][round] = new Array(questionsCount).fill(0);
        }
        const teamAnswers = this.teams[teamId].getAnswers();
        for (let answer of teamAnswers) {
            table[this.teams[teamId].name][answer.roundNumber - 1][answer.questionNumber - 1] = answer.score;
        }
        // @ts-ignore
        return table;
    }

    getTotalScoreForAllTeams(): { name: string, score: number } {
        const table = {};
        for (let teamId in this.teams) {
            table[this.teams[teamId].name] = this.teams[teamId].getTotalScore();
        }
        // @ts-ignore
        return table;
    }
}
