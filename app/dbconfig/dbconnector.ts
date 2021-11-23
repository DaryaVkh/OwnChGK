
    public static async deleteRound(gameId: number, number: number) {
        const sql = 'DELETE FROM round WHERE game_id = $1 AND number = $2 RETURNING round_id';
        const rows = await DataBase.query(sql, [gameId, number]);
        return rows[0]; // возвращает удаленный round_id;
    }

    public static async insertTeamToGame(teamId: number, gameId: number) {
        const sql = 'INSERT INTO game_team_links (team_id, game_id) VALUES ($1, $2) RETURNING team_id';
        const rows = await DataBase.query(sql, [teamId, gameId]);
        return rows[0]; // возвращает team_id добавленной к игре команды
    }

    public static async getGameTeams(gameId: number) {
        const sql = 'SELECT team_id FROM game_team_links WHERE game_id = $1';
        const rows = await DataBase.query(sql, [gameId]);
        const args = rows.map(team => team.team_id);
        const newSql = 'SELECT name FROM teams WHERE team_id = ANY($1::integer[])';
        const answer = await DataBase.query(newSql, [args]);
        return answer.map(team => team.name); // возвращает массив названий команд
    }

    public static async getTeamGames(teamId: number) {
        const sql = 'SELECT game_id FROM game_team_links WHERE team_id = $1';
        const rows = await DataBase.query(sql, [teamId]);
        const args = rows.map(game => game.game_id);
        const newSql = 'SELECT name FROM games WHERE game_id = ANY($1::integer[])';
        const answer = await DataBase.query(newSql, [args]);
        return answer.map(game => game.name); // возвращает массив названий команд
    }
}

export default DataBase;