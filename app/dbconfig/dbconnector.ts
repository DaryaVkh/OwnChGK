import {Pool} from 'pg';

abstract class DataBase {
    private static pool = new Pool({
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

    public static async getAllUsers() {
        try {
            const client = await this.pool.connect();
            const sql = "SELECT * FROM users";
            const {rows} = await client.query(sql);
            client.release();
            return rows
        } catch (error) {
            throw error;
        }
    }

    public static async getUser(email: string) {
        try {
            const client = await this.pool.connect();
            const sql = "SELECT * from users WHERE email=$1";
            const params = [email];
            const {rows} = await client.query(sql, params);
            client.release();
            if (rows.length > 0)
                return rows[0];

            throw new Error("Пользователь не найден")
        } catch (error) {
            throw error;
        }
    }

    public static async insertUser(email: string, password: string, isAdmin: boolean = false) {
        try {
            const client = await this.pool.connect();
            const sql = "INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3)";
            const params = [email, password, isAdmin];
            await client.query(sql, params);

            client.release();
        } catch (error) {
            throw new Error("Пользователь существует"); // TODO: подумать, что если БД сломалась - как сказать пользователю правду?
        }
    }
}

export default DataBase;