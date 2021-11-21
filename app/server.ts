import express, {Application, Router} from 'express';
import bodyParser from 'body-parser';
import usersRouter from './routers/usersRouter';
import adminsRouter from './routers/adminsRouter';
import teamsRouter from './routers/teamsRouter';
import gamesRouter from './routers/gamesRouter';
import roundsRouter from './routers/roundsRouter';
import mainRouter from './routers/mainRouter';
import DataBase from './dbconfig/dbconnector';
import cookieParser from 'cookie-parser';
import path from 'path';
import {createConnection} from 'typeorm';
import {User} from './db/entities/User';
import {Admin} from './db/entities/Admin';
import {Team} from './db/entities/Team';
import {Game} from './db/entities/Game';
import {Round} from './db/entities/Round';

class Server {
    private app;

    constructor() {
        this.app = express();
        this.config();
        this.routerConfig();
        try {
            this.dbConnect().then(() => console.log("Connected to Postgres"));
        } catch (error) {
            console.error(error);
            throw new Error('Unable to connect to db');
        }
    }

    private config() {
        this.app.use(bodyParser.json()); // 100kb default
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(express.static(path.resolve('./build/frontend')));
    }

    private async dbConnect() {
        await createConnection({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Admin, Team, Game, Round],
            synchronize: true // Не оч безопасно
        });
        /*DataBase.connect();*/
    }

    private routerConfig() {
        this.app.use(cookieParser());
        this.app.use('/users', usersRouter);
        this.app.use('/admins', adminsRouter);
        this.app.use('/teams', teamsRouter);
        this.app.use('/games', gamesRouter);
        this.app.use('/rounds', roundsRouter);
        this.app.use('/', mainRouter);
        this.app.use(cookieParser());
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