import {Router} from 'express';
import {UsersController} from '../controllers/usersController';
import {middleware} from '../middleware/middleware';

export const usersRouter = () => {
    const router = Router();

    const usersController = new UsersController();

    router.get('/', middleware, usersController.getAll);
    router.post('/login', usersController.login);
    router.post('/insert', usersController.insert);
    router.post('/logout', usersController.logout);
    router.patch('/:gameId/changeToken', usersController.changeTokenWhenGoIntoGame);

    return router;
}
