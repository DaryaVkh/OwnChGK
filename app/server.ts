import express from 'express';
import bodyParser from 'body-parser';
import {UsersRouter} from './routers/usersRouter';
import {AdminsRouter} from './routers/adminsRouter';
import {TeamsRouter} from './routers/teamsRouter';
import {GamesRouter} from './routers/gamesRouter';
import {RoundsRouter} from './routers/roundsRouter';
import {MainRouter} from './routers/mainRouter';
import cookieParser from 'cookie-parser';
import path from 'path';
import {createConnection} from 'typeorm';
import {User} from './db/entities/User';
import {Admin} from './db/entities/Admin';
import {Team} from './db/entities/Team';
import {Game} from './db/entities/Game';
import {Round} from './db/entities/Round';

export class Server {
    private app;

    constructor() {
        this.app = express();
        this.config().then(() => {});
    }

    private async config() {
        try {
            await createConnection({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [User, Admin, Team, Game, Round],
                synchronize: true // Не оч безопасно
            }).then(() => {
                console.log('Connected to Postgres')
                this.app.use(bodyParser.json()); // 100kb default
                this.app.use(bodyParser.urlencoded({extended: true}));
                this.app.use(express.static(path.resolve('./build/frontend')));

                this.routerConfig();
            });
        } catch (error) {
            console.error(error);
            throw new Error('Unable to connect to db');
        }
    }

    private routerConfig() {
        this.app.use(cookieParser());
        this.app.use('/users', new UsersRouter().router);
        this.app.use('/admins', new AdminsRouter().router);
        this.app.use('/teams', new TeamsRouter().router);
        this.app.use('/games', new GamesRouter().router);
        this.app.use('/rounds', new RoundsRouter().router);
        this.app.use('/', new MainRouter().router);
    }

    public start = (port: number) => {
        return new Promise((resolve, reject) => {
            this.app.listen(port, '0.0.0.0', () => {
                resolve(port);
            }).on('error', (err: Object) => reject(err));
        });
    }
}

export default Server;