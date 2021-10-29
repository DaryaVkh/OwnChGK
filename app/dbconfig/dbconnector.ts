import {Pool} from 'pg';

abstract class DataBase {
    private static pool: Pool = new Pool({
        max: 20,
        connectionString: process.env.DATABASE_URL,
        idleTimeoutMillis: 30000,
        ssl: {rejectUnauthorized: false} // нужно для heroku
    });

    public static connect() {
        DataBase.pool.connect(function (err, client, done) {
            if (err) throw err;
            console.log('Connected');
        });
    }

    private static async query(sql, params = []) {
        let client: any;
        try {
            client = await this.pool.connect();
            const {rows} = await client.query(sql, params);
            return rows;
        } catch (error) {
            throw error; // Здесь возможна обработка всевозможных ошибок из БД
        } finally {
            client.release();
        }
    }

    public static async getAllUsers() {
        const sql = "SELECT * FROM users";
        return await DataBase.query(sql);
    }

    public static async getUser(id: number);
    public static async getUser(email: string);
    public static async getUser(idOrEmail: number | string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "SELECT * from users WHERE email=$1";
        } else {
            sql = "SELECT * from users WHERE user_id=$1";
        }

        const rows = await DataBase.query(sql, [idOrEmail]);
        if (rows.length > 0)
            return rows[0];

        throw new Error("Пользователь не найден");
    }

    public static async insertUser(email: string, password: string) {
        const sql = "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING user_id";
        const rows = await DataBase.query(sql, [email, password]);
        return rows[0]; // возвращает назначенный юзеру id
    }

    public static async deleteUser(id: number);
    public static async deleteUser(email: string);
    public static async deleteUser(idOrEmail: number | string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "DELETE FROM users WHERE email = $1 RETURNING user_id";
        } else {
            sql = "DELETE FROM users WHERE id = $1 RETURNING user_id";
        }

        const rows = await DataBase.query(sql, [idOrEmail]);
        return rows[0]; // возвращает id удаленного пользователя
    }

    public static async changeUserName(id: number, newName: string);
    public static async changeUserName(email: string, newName: string);
    public static async changeUserName(idOrEmail: number | string, newName: string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "UPDATE users SET name = $1 WHERE email = $2 RETURNING name";
        } else {
            sql = "UPDATE users SET name = $1 WHERE user_id = $2 RETURNING name";
        }

        const rows = await DataBase.query(sql, [newName, idOrEmail]);
        return rows[0]; // возвращает name измененного пользователя
    }

    public static async changeUserPassword(id: number, newPassword: string);
    public static async changeUserPassword(email: string, newPassword: string);
    public static async changeUserPassword(idOrEmail: number | string, newPassword: string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "UPDATE users SET password = $1 WHERE email = $2 RETURNING password";
        } else {
            sql = "UPDATE users SET password = $1 WHERE user_id = $2 RETURNING password";
        }

        const rows = await DataBase.query(sql, [newPassword, idOrEmail]);
        return rows[0]; // возвращает password измененного пользователя
    }

    public static async getAllAdmins() {
        const sql = "SELECT * FROM admins";
        return await DataBase.query(sql);
    }

    public static async getAdmin(id: number);
    public static async getAdmin(email: string);
    public static async getAdmin(idOrEmail: number | string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "SELECT * from admins WHERE email=$1";
        } else {
            sql = "SELECT * from admins WHERE admin_id=$1";
        }

        const rows = await DataBase.query(sql, [idOrEmail]);
        if (rows.length > 0)
            return rows[0];

        throw new Error("Админ не найден");
    }

    public static async insertAdmin(email: string, password: string) {
        const sql = "INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING admin_id";
        const rows = await DataBase.query(sql, [email, password]);
        return rows[0]; // возвращает назначенный админу id
    }

    public static async deleteAdmin(id: number);
    public static async deleteAdmin(email: string);
    public static async deleteAdmin(idOrEmail: number | string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "DELETE FROM admins WHERE email = $1 RETURNING admin_id";
        } else {
            sql = "DELETE FROM admins WHERE id = $1 RETURNING admin_id";
        }

        const rows = await DataBase.query(sql, [idOrEmail]);
        return rows[0]; // возвращает id удаленного админа
    }

    public static async changeAdminPassword(id: number, newPassword: string);
    public static async changeAdminPassword(email: string, newPassword: string);
    public static async changeAdminPassword(idOrEmail: number | string, newPassword: string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "UPDATE admins SET name = $1 WHERE email = $2 RETURNING name";
        } else {
            sql = "UPDATE admins SET name = $1 WHERE admin_id = $2 RETURNING name";
        }

        const rows = await DataBase.query(sql, [newPassword, idOrEmail]);
        return rows[0]; // возвращает name измененного админа
    }

    public static async getAllTeams() {
        const sql = "SELECT * FROM teams";
        return await DataBase.query(sql);
    }

    public static async getTeam(id: number);
    public static async getTeam(name: string);
    public static async getTeam(idOrName: number | string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "SELECT * FROM teams WHERE name = $1";
        } else {
            sql = "SELECT * FROM teams WHERE team_id = $1";
        }

        const rows = await DataBase.query(sql, [idOrName]);
        if (rows.length > 0)
            return rows[0];

        throw new Error("Команда не найдена");
    }

    public static async insertTeam(name: string, captainId: number) {
        const sql = "INSERT INTO teams (name, captain_id) VALUES ($1, $2) RETURNING team_id";
        const rows = await DataBase.query(sql, [name, captainId]);
        return rows[0]; // возвращает назначенный команде id
    }

    public static async deleteTeam(id: number);
    public static async deleteTeam(name: string);
    public static async deleteTeam(idOrName: number | string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "DELETE FROM teams WHERE name = $1 RETURNING team_id";
        } else {
            sql = "DELETE FROM teams WHERE team_id = $1 RETURNING team_id";
        }

        const rows = await DataBase.query(sql, [idOrName]);
        return rows[0]; // возвращает id удаленной команды
    }

    public static async changeTeamParticipants(id: number, newParticipants: string[]);
    public static async changeTeamParticipants(name: string, newParticipants: string[]);
    public static async changeTeamParticipants(idOrName: number | string, newParticipants: string[]) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "UPDATE teams SET participants = $1 WHERE name = $2 RETURNING participants";
        } else {
            sql = "UPDATE teams SET participants = $1 WHERE team_id = $2 RETURNING participants";
        }

        const rows = await DataBase.query(sql, [newParticipants, idOrName]); // TODO: Нужно протестировать как тут массив вставляется
        return rows[0]; // возвращает participants измененной команды
    };

    public static async changeTeamName(id: number, newName: string);
    public static async changeTeamName(name: string, newName: string);
    public static async changeTeamName(idOrName: number | string, newName: string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "UPDATE teams SET name = $1 WHERE name = $2 RETURNING name";
        } else {
            sql = "UPDATE teams SET name = $1 WHERE team_id = $2 RETURNING name";
        }

        const rows = await DataBase.query(sql, [newName, idOrName]);
        return rows[0]; // возвращает name измененной команды
    };

    public static async changeTeamCaptainId(id: number, newCaptainId: string);
    public static async changeTeamCaptainId(name: string, newCaptainId: string);
    public static async changeTeamCaptainId(idOrName: number | string, newCaptainId: string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "UPDATE teams SET captain_id = $1 WHERE name = $2 RETURNING captain_id";
        } else {
            sql = "UPDATE teams SET captain_id = $1 WHERE team_id = $2 RETURNING captain_id";
        }

        const rows = await DataBase.query(sql, [newCaptainId, idOrName]);
        return rows[0]; // возвращает captain_id измененной команды
    };

    public static async getAllGames() {
        const sql = "SELECT * FROM games";
        return await DataBase.query(sql);
    }

    public static async getGame(id: number);
    public static async getGame(name: string);
    public static async getGame(idOrName: number | string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "SELECT * FROM games WHERE name = $1";
        } else {
            sql = "SELECT * FROM games WHERE game_id = $1";
        }

        const rows = await DataBase.query(sql, [idOrName]);
        if (rows.length > 0)
            return rows[0];

        throw new Error("Игра не найдена");
    }

    public static async insertGame(name: string, adminId: number) {
        const sql = "INSERT INTO games (name, admin_id) VALUES ($1, $2) RETURNING admin_id";
        const rows = await DataBase.query(sql, [name, adminId]);
        return rows[0]; // возвращает назначенный игре id
    }

    public static async deleteGame(id: number);
    public static async deleteGame(name: string);
    public static async deleteGame(idOrName: number | string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "DELETE FROM games WHERE name = $1 RETURNING game_id";
        } else {
            sql = "DELETE FROM games WHERE game_id = $1 RETURNING game_id";
        }

        const rows = await DataBase.query(sql, [idOrName]);
        return rows[0]; // возвращает id удаленной игры
    }

    public static async changeGameName(id: number, newName: string);
    public static async changeGameName(name: string, newName: string);
    public static async changeGameName(idOrName: number | string, newName: string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "UPDATE games SET name = $1 WHERE name = $2 RETURNING name";
        } else {
            sql = "UPDATE games SET name = $1 WHERE game_id = $2 RETURNING name";
        }

        const rows = await DataBase.query(sql, [newName, idOrName]);
        return rows[0]; // возвращает name измененной игры
    };

    public static async changeGameAdminId(id: number, newAdminId: string);
    public static async changeGameAdminId(name: string, newAdminId: string);
    public static async changeGameAdminId(idOrName: number | string, newAdminId: string) {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "UPDATE admins SET admin_id = $1 WHERE name = $2 RETURNING admin_id";
        } else {
            sql = "UPDATE admins SET admin_id = $1 WHERE admin_id = $2 RETURNING admin_id";
        }

        const rows = await DataBase.query(sql, [newAdminId, idOrName]);
        return rows[0]; // возвращает admin_id измененной игры
    };

    public static async changeGameStatus(id: number, newStatus: string);
    public static async changeGameStatus(name: string, newStatus: string);
    public static async changeGameStatus(idOrName: number | string, newStatus: string = 'not_started') {
        let sql: string;
        if (typeof idOrName === 'string') {
            sql = "UPDATE games SET status = $1 WHERE name = $2 RETURNING status";
        } else {
            sql = "UPDATE games SET status = $1 WHERE game_id = $2 RETURNING status";
        }

        const rows = await DataBase.query(sql, [newStatus, idOrName]);
        return rows[0]; // возвращает status измененной игры
    };

    public static async getRounds(gameId: number) {
        const sql = "SELECT * FROM rounds WHERE game_id = $1";
        return await DataBase.query(sql, [gameId]);
    }

    public static async insertRound(number: number, gameId: number,
                                    questionsNumber: number,
                                    questionsCost: number,
                                    questionTime: number) {
        const sql = "INSERT INTO rounds (number, game_id, questions_number, questions_cost, questions_time) " +
            "VALUES ($1, $2, $3, $4, $5) RETURNING round_id";
        const rows = await DataBase.query(sql, [number, gameId, questionsNumber, questionsCost, questionTime]);
        return rows[0]; // возвращает назначенный раунду Id;
    }

    public static async changeRoundSettings(gameId: number, number: number,
                                            newNumber: number,
                                            newQuestionsNumber: number,
                                            newQuestionsCost: number,
                                            newQuestionTime: number) {
        const sql = "UPDATE rounds SET number = $1, questions_number = $2, questions_cost = $3, questions_time = $4 " +
            "WHERE game_id = $5 AND number = $6 RETURNING round_id";
        const rows = await DataBase.query(sql,
            [newNumber, newQuestionsNumber, newQuestionsCost, newQuestionTime, gameId, number]);
        return rows[0]; // возвращает round_id измененного раунда;
    };

    public static async deleteRound(gameId: number, number: number) {
        const sql = "DELETE FROM round WHERE game_id = $1 AND number = $2 RETURNING round_id";
        const rows = await DataBase.query(sql, [gameId, number]);
        return rows[0]; // возвращает удаленный round_id;
    }

    public static async insertTeamToGame(teamId: number, gameId: number) {
        const sql = "INSERT INTO game_team_links (team_id, game_id) VALUES ($1, $2) RETURNING team_id";
        const rows = await DataBase.query(sql, [teamId, gameId]);
        return rows[0]; // возвращает team_id добавленной к игре команды
    }

    public static async getGameTeams(gameId: number) {
        const sql = "SELECT team_id FROM game_team_links WHERE game_id = $1";
        const rows = await DataBase.query(sql, [gameId]);
        const args = rows.map(team => team.team_id);
        const newSql = "SELECT name FROM teams WHERE team_id = ANY($1::integer[])";
        const answer = await DataBase.query(newSql, [args]);
        return answer.map(team => team.name); // возвращает массив названий команд
    }

    public static async getTeamGames(teamId: number) {
        const sql = "SELECT game_id FROM game_team_links WHERE team_id = $1";
        const rows = await DataBase.query(sql, [teamId]);
        const args = rows.map(game => game.game_id);
        const newSql = "SELECT name FROM games WHERE game_id = ANY($1::integer[])";
        const answer = await DataBase.query(newSql, [args]);
        return answer.map(game => game.name); // возвращает массив названий команд
    }
}

export default DataBase;