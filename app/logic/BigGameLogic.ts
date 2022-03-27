import {Game} from './Game';


export class BigGameLogic {

    constructor(name:String, ChGK: Game = null, Matrix: Game = null) {
        this.Matrix = Matrix;
        this.ChGK = ChGK;
        this.name = name;
        this.CurrentGame = this.ChGK;
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