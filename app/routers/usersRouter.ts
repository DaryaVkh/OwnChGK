import {Router} from 'express';
import {UsersController} from '../controllers/usersController';
import {middleware} from '../middleware/middleware';

export class UsersRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.config();
    }

    private config() {
        const usersController = new UsersController();

        this.router.get('/', middleware, usersController.getAll);
        this.router.post('/login', usersController.login);
        this.router.post('/insert', usersController.insert);
        this.router.post('/logout', usersController.logout);
    }
}