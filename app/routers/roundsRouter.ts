import {Router} from 'express';
import {RoundsController} from '../controllers/roundsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';

export class RoundsRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.config();
    }

    private config() {
        const roundsController = new RoundsController();

        this.router.get('/', middleware, roundsController.getAll);
        this.router.patch('/settings', roleMiddleware(true), roundsController.editRound);
        this.router.delete('/team', roleMiddleware(true), roundsController.deleteRound);

        this.router.post('/', () => roundsController.insertRound);
    }
}