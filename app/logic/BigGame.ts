import {Game} from './Game';


export class BigGame {

    constructor(name:String, ChGK: Game = null, Matrix: Game = null) {
        this.Matrix = Matrix;
        this.ChGK = ChGK;
        this.name = name;
    }

    private name: String;
    private ChGK: Game;
    private Matrix: Game;
    public CurrentGame: Game;
}


function addChGK(id: number) {
    this.ChGK = id;
}

function addMatrix(id: number) {
    this.Matrix = id;
}