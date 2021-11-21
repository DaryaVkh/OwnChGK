import {Router} from 'express';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import {GamesController} from '../controllers/gamesController';

export class GamesRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.config();
    }

    private config() {
        const gamesController = new GamesController();

        this.router.get('/', middleware, gamesController.getAll);
        this.router.get('/game', middleware, gamesController.getGame);
        this.router.get('/teams', middleware, gamesController.getAllTeams);
        this.router.patch('/status', roleMiddleware(true), gamesController.changeGameStatus);
        this.router.patch('/name', roleMiddleware(true), gamesController.editGameName);
        this.router.patch('/admin', roleMiddleware(true), gamesController.editGameAdmin);
        this.router.delete('/game', roleMiddleware(true), gamesController.deleteGame);

        this.router.post('/', roleMiddleware(true), gamesController.insertGame);
    }
}