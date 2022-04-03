import {Team} from './Team';
import {Question} from './Question';
import {seconds70PerQuestion} from '../socket';


export class Round {
    public readonly number: number;
    public readonly questions: Question[];
    public readonly questionsCount: number;
    public readonly questionTime: number;
    public readonly gameType: GameTypeLogic;

    constructor(number: number, questionsCount: number, questionTime: number, gameType=GameTypeLogic.ChGK) {
        this.gameType = gameType;
        this.questionsCount = questionsCount;
        this.questionTime = questionTime;
        this.number = number;
        this.questions = this.createQuestions();
    }

    createQuestions(): Question[] {
        const result = [];
        if (this.gameType == GameTypeLogic.ChGK) {
            for (let i = 1; i <= this.questionsCount; i++) {
                result.push(new Question(1, this.number, i, this.questionTime));
            }
        }
        else for (let i = 1; i <= this.questionsCount; i++) {
            result.push(new Question(i*this.questionsCount, this.number, i, this.questionTime));
        }
        return result;
    }
}

export enum GameStatus {
    IsOnBreak,
    Start
}

export enum GameTypeLogic {
    Matrix,
    ChGK
}

export class Game {
    public readonly id: string;
    public readonly name: string;
    public readonly rounds: Round[];
    public readonly teams: { [teamId: string]: Team };
    public status: GameStatus;
    public breakTime: number;
    private interval: any;
    public currentQuestion: [number, number];
    public isTimerStart: boolean;
    public isIntrigue: boolean;
    public type: GameTypeLogic;

    public timer: any;
    public leftTime: number;
    public maxTime: number;
    public timeIsOnPause: boolean;

    constructor(name: string, type: GameTypeLogic) {
        this.id = Math.round(Math.random() * 1000000).toString() // TODO: принимать из БД
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
        this.type = type;
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

    getScoreTableForTeam(teamId: string): { name: string, scoreTable: number[][] } {
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

    static getScoreTableWithFormat(game: Game, scoreTable: { name: string, scoreTable: number[][] }): string {
        const headersList = ['Название команды', 'Сумма'];
        for (let i = 1; i <= game.rounds.length; i++) {
            headersList.push('Тур ' + i);
            for (let j = 1; j <= game.rounds[i - 1].questionsCount; j++) {
                headersList.push('Вопрос ' + j);
            }
        }

        const teamRows = [];
        const totalScoreForAllTeams = game.getTotalScoreForAllTeams();

        let roundsResultList = [];
        for (const team in scoreTable) {
            let roundSum = 0;
            for (let i = 0; i < game.rounds.length; i++) {
                for (let j = 0; j < game.rounds[i].questionsCount; j++) {
                    roundSum += scoreTable[team][i][j];
                }
                roundsResultList.push(roundSum);
                roundsResultList.push(scoreTable[team][i].join(';'));
                roundSum = 0;
            }
            teamRows.push(team + ';' + totalScoreForAllTeams[team] + ';' + roundsResultList.join(';'));
            roundsResultList = [];
        }

        const headers = headersList.join(';');
        const value = teamRows.join('\n');

        return [headers, value].join('\n');
    }
}
