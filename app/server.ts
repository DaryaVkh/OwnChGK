import express from 'express';
import bodyParser from 'body-parser';
import {usersRouter} from './routers/usersRouter';
import {adminsRouter} from './routers/adminsRouter';
import {teamsRouter} from './routers/teamsRouter';
import {gamesRouter} from './routers/gamesRouter';
import {roundsRouter} from './routers/roundsRouter';
import {mainRouter} from './routers/mainRouter';
import cookieParser from 'cookie-parser';
import boolParser from 'express-query-boolean';
import path from 'path';
import {createConnection} from 'typeorm';
import {Server as WSServer} from 'ws';
import {Game} from './db/entities/Game';
import {User} from './db/entities/User';
import {Admin} from './db/entities/Admin';
import {Team} from './db/entities/Team';
import {Round} from './db/entities/Round';
import {HandlerWebsocket} from './socket';
import {BigGame} from "./db/entities/BigGame";
import {Question} from "./db/entities/Questions";

export class Server {
    private app;

    constructor() {
        this.app = express();
        this.config();
        this.routerConfig();
        this.DBconnection().then(() => {});
    }

    private async DBconnection() {
        try {
            await createConnection({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [User, Admin, Team, BigGame, Game, Round, Question],
                synchronize: true,
                ssl: {rejectUnauthorized:false} // для хероку
            }).then(() => {
                console.log('Connected to Postgres')
            });
        } catch (error) {
            console.error(error);
            throw new Error('Unable to connect to db');
        }
    }

    private config() {
        this.app.use(bodyParser.json()); // 100kb default
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(boolParser());
        this.app.use(express.static(path.resolve('./build/frontend')));
    }

    private routerConfig() {
        this.app.use(cookieParser());
        this.app.use('/api/users', usersRouter());
        this.app.use('/api/admins', adminsRouter());
        this.app.use('/api/teams', teamsRouter());
        this.app.use('/api/games', gamesRouter());
        this.app.use('/api/rounds', roundsRouter());
        this.app.use('/', mainRouter());
    }

    public start = (port: number) => {
        return new Promise((resolve, reject) => {
            const server = this.app.listen(port, '0.0.0.0', () => {
                resolve(port);
            }).on('error', (err: Object) => reject(err));

            const wss = new WSServer({server});
            wss.on('connection', (ws) => {
                ws.on('message', (message: string) => {
                    try {
                        HandlerWebsocket(ws, message);
                    } catch (error: any) {
                        ws.send(JSON.stringify({
                            'action': 'ERROR'
                        }));
                        console.log(error);
                    }
                });
            });
        });
    }
}

export default Server;