import {Team} from "../db/entities/Team";

export class TeamDto {
    public readonly name: string;
    public readonly id: string;
    public readonly captain: string;
    public readonly captainId: string;

    constructor(team: Team) {
        this.name = team.name;
        this.id = team.id.toString();
        this.captain = team.captain?.email; // TODO: мб на UserDto?
        this.captainId = team.captain?.id.toString();
    }
}