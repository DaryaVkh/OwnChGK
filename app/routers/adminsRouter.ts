import {Router} from 'express';
import {AdminsController} from '../controllers/adminsController';
import {roleMiddleware} from '../middleware/roleMiddleware';

export class AdminsRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.config();
    }

    private config() {
        const adminsController = new AdminsController();

        this.router.get('/', roleMiddleware(true), adminsController.getAll);
        this.router.post('/login', adminsController.login);
        this.router.post('/add', adminsController.insert);
        this.router.post('/logout', adminsController.logout);
    }
}