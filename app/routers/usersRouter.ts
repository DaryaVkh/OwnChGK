import {Router} from 'express';
import {UsersController} from '../controllers/usersController';
import {middleware} from '../middleware/middleware';

export const usersRouter = () => {
    const router = Router();

    const usersController = new UsersController();

    router.get('/', middleware, usersController.getAll);
    router.get('/current', usersController.get);
    router.post('/login', usersController.login);
    router.post('/insert', usersController.insert);
    router.post('/logout', usersController.logout);
    router.post('/sendMail', usersController.sendPasswordWithTemporaryPassword);
    router.post('/checkTemporaryPassword', usersController.confirmTemporaryPassword);
    router.get('/getTeam', usersController.getTeam);
    router.patch('/:gameId/changeToken', usersController.changeTokenWhenGoIntoGame);
    router.patch('/changePasswordByCode', usersController.changePasswordByCode);
    router.patch('/changePassword', usersController.changePasswordByOldPassword);

    return router;
}
