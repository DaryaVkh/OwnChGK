export class Team {
    private name: string;
    public id: number;
    private players: string[];
    private totalCount: number = 0;
    private count: number[];

    constructor(name: string, teammates: string[]) {
        this.name = name
        this.id = Math.random() * 1000000 + Math.random() * 3;
        this.players = teammates;
        this.count = [];
    }

    renameTeam(newName: string){
        this.name = newName;
    }

    changePlayers(players: string[])
    {
        this.players = players;
    }

    addPlayer(player: string){
        this.players.push(player);
    }

    deletePlayer(player: string){
        const ind = this.players.indexOf(player);
        if (ind >= 0)
            this.players.splice(ind, 1);
    }
}