export class Team {
    private name: string;
    public id: number;
    private players: string[];
    private totalCount: number = 0;
    private count: number[];

    constructor(name: string, teammates: string[]) {
        this.name = name
        this.id = Math.round(Math.random() * 1000000);
        this.players = teammates;
        this.count = [];
    }

    renameTeam(newName: string) {
        this.name = newName;
    }

    changePlayers(players: string[]) {
        this.players = players;
    }

    addPlayer(player: string) {
        this.players.push(player);
    }

    deletePlayer(player: string) {
        const ind = this.players.indexOf(player);
        if (ind >= 0)
            this.players.splice(ind, 1);
    }

    processRightAnswer(questionNumber: number) {
        this.totalCount += 1;
        this.count[questionNumber - 1] = 1; // см в ноушн
    }

    processWrongAnswer() {

    }
}

export class Question {
    private cost: number;
    private number: number;
    private time: number;
    answers: Answer[];
    private appeal: Appeal[];

    constructor(cost: number, number: number, time: number) {
        this.cost = cost
        this.number = number;
        this.time = number;
        this.answers = [];
        this.appeal = [];
    }
}

enum Status { Right, Wrong, UnChecked};

export class Answer {
    public readonly teamNumber: number;
    public readonly text: string;
    private status: Status;

    constructor(teamNumber: number, text: string) {
        this.teamNumber = teamNumber;
        this.text = text;
        this.status = Status.UnChecked;
    }

    accept() {
        this.status = Status.Right;
    }

    reject() {
        this.status = Status.Wrong;
    }
}

export class Appeal {
    private teamNumber: number;
    private text: string;
    public comment: string;
    private status: Status;

    constructor(teamNumber: number, text: string) {
        this.teamNumber = teamNumber;
        this.text = text;
        this.status = Status.UnChecked;
        this.comment = "";
    }
}

export class Round {
    public questions: Question[];
    private readonly questionsCount: number;
    private readonly questionTime: number;
    private readonly questionCost: number;

    constructor(questionsCount: number, questionTime: number, questionCost: number) {
        this.questionCost = questionCost;
        this.questionsCount = questionsCount;
        this.questionTime = questionTime;
        this.questions = this.createQuestions();
    }

    createQuestions() {
        let result = [];
        for (let i = 1; i <= this.questionsCount; i++) {
            result.push(new Question(this.questionCost, i, this.questionTime));
        }
        return result;
    }
}

export class Game {
    private id: number;
    private name: string;
    private rounds: Round[];
    private teams: Map<number, Team>;
    private chillTime: number;

    constructor(name: string, chillTime: number) {
        this.id = Math.round(Math.random() * 1000000)
        this.name = name;
        this.rounds = [];
        this.teams = new Map<number, Team>();
        this.chillTime = chillTime;
    }

    addTeam(team: Team) {
        this.teams.set(team.id, team);
    }

    addRound(round: Round) {
        this.rounds.push(round);
    }

    acceptAnswers(roundNumber: number, questionNumber: number, rightAnswer: string) {
        let r = this.rounds[roundNumber-1];
        let q = r.questions[questionNumber-1];
        for (let answer of q.answers) {
            if (answer.text === rightAnswer) {
                answer.accept()
                    //addpoint
            }
        }
    }
}