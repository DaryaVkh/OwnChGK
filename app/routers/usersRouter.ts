import {Router} from 'express';
import {UsersController} from '../controllers/usersController';
import {middleware} from '../middleware/middleware';
import {body, param, query} from "express-validator";

export const usersRouter = () => {
    const router = Router();

    const usersController = new UsersController();

    router.get('/',
        middleware,
        query('withoutTeam').isBoolean(), usersController.getAll);

    router.get('/current', usersController.get);

    router.post('/login',
        body('email').isEmail(),
        body('password').isString().notEmpty(), usersController.login);

    router.post('/insert',
        body('email').isEmail(),
        body('password').isString().notEmpty(), usersController.insert);

    router.post('/logout', usersController.logout);

    router.post('/sendMail',
        body('email').isEmail(), usersController.sendPasswordWithTemporaryPassword);

    router.post('/checkTemporaryPassword',
        body('email').isEmail(),
        body('code').isString().notEmpty(), usersController.confirmTemporaryPassword);

    router.get('/getTeam', middleware, usersController.getTeam);

    router.patch('/:gameId/changeToken',
        middleware,
        param('gameId').isInt(), usersController.changeTokenWhenGoIntoGame); // TODO url

    router.patch('/changePasswordByCode',
        body('email').isEmail(),
        body('password').isString().notEmpty(),
        body('code').isString().notEmpty(), usersController.changePasswordByCode);

    router.patch('/changeName',
        middleware,
        body('newName').isString(), usersController.changeName);

    router.patch('/changePassword',
        middleware,
        body('email').isEmail(),
        body('password').isString().notEmpty(),
        body('oldPassword').isString().notEmpty(), usersController.changePasswordByOldPassword);

    return router;
}
