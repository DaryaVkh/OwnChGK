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

    onAppeal(): void {
        this._status = Status.OnAppeal;
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
        this._comment = '';
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

export enum Status { Right, Wrong, UnChecked, OnAppeal}