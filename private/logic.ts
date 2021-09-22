export class Team {
    public readonly name: string;
    public readonly id: number;
    private readonly answers: Answer[];

    constructor(name: string) {
        this.name = name
        this.id = Math.round(Math.random() * 1000000);
        this.answers = [];
    }

    addAnswer(answer: Answer): void {
        this.answers.push(answer);
    }

    getTotalScore(): number {
        let sum = 0;
        for (const answer of this.answers) {
            sum += answer.score;
        }
        return sum;
    }

    getAnswer(roundNumber: number, questionNumber: number): Answer | undefined {
        return this.answers.find((value, index, obj) =>
            value.roundNumber === roundNumber && value.questionNumber === questionNumber);
    }

    getScoreTable(): number[][] {
        // TODO
        return [];
    }
}

export class Question {
    public readonly cost: number;
    public readonly number: number;
    public readonly time: number;
    public readonly roundNumber: number;
    private readonly answers: Answer[]; // TODO: public? Сейчас непонятно, как получить ответы
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
        const answer = new Answer(team.id, this.roundNumber, this.number, text);
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
            answer.accept(this.cost);
        }
    }
}

enum Status { Right, Wrong, UnChecked}

export class Answer {
    public readonly teamNumber: number;
    public readonly text: string;
    public readonly roundNumber: number;
    public readonly questionNumber: number;
    private _score: number;
    private _status: Status;

    constructor(teamNumber: number, roundNumber: number, questionNumber: number, text: string) {
        this.teamNumber = teamNumber;
        this.roundNumber = roundNumber;
        this.questionNumber = questionNumber;
        this.text = text;
        this._status = Status.UnChecked;
        this._score = 0;
    }

    public get status() {
        return this._status;
    }

    public get score() {
        return this._score;
    }

    accept(score: number): void {
        this._status = Status.Right;
        this._score = score;
    }

    reject(): void {
        this._status = Status.Wrong;
        this._score = 0;
    }
}

export class Appeal {
    public readonly teamNumber: number;
    public readonly text: string;
    public readonly roundNumber: number;
    public readonly questionNumber: number;
    private _comment: string;
    private _status: Status;

    constructor(teamNumber: number, roundNumber: number, questionNumber: number, text: string) {
        this.teamNumber = teamNumber;
        this.roundNumber = roundNumber;
        this.questionNumber = questionNumber;
        this.text = text;
        this._status = Status.UnChecked;
        this._comment = "";
    }

    public get status() {
        return this._status;
    }

    public get comment() {
        return this._comment;
    }

    accept(comment: string): void {
        this._status = Status.Right;
        this._comment = comment;
    }

    reject(comment: string): void {
        this._comment = comment;
        this._status = Status.Wrong;
    }
}

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