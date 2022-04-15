import {ChgkSettingsDto} from "./chgkSettingsDto";
import {Game} from "../db/entities/Game";

export class MatrixSettingsDto extends ChgkSettingsDto {
    public readonly roundNames: string[];

    constructor(game: Game) {
        super(game);
        this.roundNames = this.roundCount !== 0 ? game.rounds.map(round => round.name) : [];
    }
}