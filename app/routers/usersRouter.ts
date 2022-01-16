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
    router.get('/getTeam', middleware, usersController.getTeam);
    router.patch('/:gameId/changeToken', middleware, usersController.changeTokenWhenGoIntoGame); // TODO url
    router.patch('/changePasswordByCode', usersController.changePasswordByCode);
    router.patch('/changeName', middleware, usersController.changeName);
    router.patch('/changePassword', middleware, usersController.changePasswordByOldPassword);

    return router;
}
