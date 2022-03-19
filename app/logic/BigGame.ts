import {Game} from './Game';


export class BigGame {
    private ChGK: Game;
    private Matrix: Game;
}
//прокидывать команды отсюда в кажду их игр,- в трех местах одинаковые списки
// или сохранять их только там - дублируем в 2 местах
// или только здесь - тогда в маленькой игре хранить ссылку на большую

function addChGK(id: number) {
    this.ChGK = id;
}

function addMatrix(id: number) {
    this.Matrix = id;
}