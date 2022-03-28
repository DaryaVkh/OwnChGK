import {Admin} from "../db/entities/Admin";

export class AdminDto {
    public readonly name: string;
    public readonly id: string;
    public readonly email: string;
    public readonly role: string;

    constructor(admin: Admin) {
        this.name = admin.name;
        this.id = admin.id.toString();
        this.email = admin.email;
        this.role = admin.role;
    }
}