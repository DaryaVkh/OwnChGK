import express, {Application, Router} from 'express';
import bodyParser from 'body-parser';
import usersRouter from './routers/usersRouter';
import mainRouter from "./routers/mainRouter";
import DataBase from "./dbconfig/dbconnector";
import cookieParser from "cookie-parser";
import path from "path";

class Server {
    private app;

    constructor() {
        this.app = express();
        this.config();
        this.routerConfig();
        this.dbConnect();
    }

    private config() {
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(express.static(path.resolve('./build/frontend')));
        this.app.use(bodyParser.json({limit: '1mb'})); // 100kb default
    }

    private dbConnect() {
        DataBase.connect();
    }

    private routerConfig() {
        this.app.use(cookieParser());
        this.app.use('/users', usersRouter);
        this.app.use('/', mainRouter);
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