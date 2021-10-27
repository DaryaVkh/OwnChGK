import {Pool} from 'pg';

abstract class DataBase {
    private static pool: Pool = new Pool({
        max: 20,
        connectionString: process.env.DATABASE_URL,
        idleTimeoutMillis: 30000,
        ssl: { rejectUnauthorized: false } // нужно для heroku
    });

    public static connect() {
        DataBase.pool.connect(function (err, client, done) {
            if (err) throw err;
            console.log('Connected');
        });
    }

    private static async query(sql, params=[]) {
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
    public static async getTeam(idOrEmail: number | string) {
        let sql: string;
        if (typeof idOrEmail === 'string') {
            sql = "SELECT * FROM teams WHERE name = $1";
        } else {
            sql = "SELECT * FROM teams WHERE team_id = $1";
        }

        const rows = await DataBase.query(sql, [idOrEmail]);
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
}

export default DataBase;