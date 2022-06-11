import {Game, GameStatus} from './Game';


export class BigGameLogic {
    private name: String;
    public ChGK: Game;
    public Matrix: Game;
    public CurrentGame: Game;

    public status: GameStatus;
    public breakTime: number;
    private interval: any;
    public isIntrigue: boolean;

    constructor(name:String, ChGK: Game = null, Matrix: Game = null) {
        this.Matrix = Matrix;
        this.ChGK = ChGK;
        this.name = name;
        this.CurrentGame = this.Matrix ?? this.ChGK;

        this.status = GameStatus.Start;
        this.breakTime = 0;
    }

    isFullGame() {
        return this.Matrix && this.ChGK;
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
}