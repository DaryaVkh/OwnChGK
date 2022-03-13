import {User} from "../db/entities/User";

export class UserDto {
    public readonly name: string;
    public readonly id: string;
    public readonly email: string;
    public readonly role = 'user';
    public readonly team: string; // TODO: мб TeamDto?

    constructor(user: User) {
        this.name = user.name;
        this.id = user.id.toString();
        this.email = user.email;
        this.team = user.team?.name;
    }
}