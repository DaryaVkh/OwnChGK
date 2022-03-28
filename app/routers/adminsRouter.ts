import {Router} from 'express';
import {AdminsController} from '../controllers/adminsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {adminAccess, superAdminAccess} from "./mainRouter";
import {body} from "express-validator";

export const adminsRouter = () => {
    const router = Router();

    const adminsController = new AdminsController();

    router.get('/',
        roleMiddleware(adminAccess), adminsController.getAll);

    router.post('/login',
        body('email').isEmail(),
        body('password').isString().notEmpty(), adminsController.login);

    router.post('/insert',
        roleMiddleware(superAdminAccess),
        body('email').isEmail(),
        body('name').optional().isString(),
        body('password').optional().isString(), adminsController.insert);

    router.post('/logout', adminsController.logout);

    router.post('/delete',
        roleMiddleware(superAdminAccess),
        body('email').isEmail(), adminsController.delete);

    router.post('/sendMail',
        body('email').isEmail(), adminsController.sendPasswordWithTemporaryPassword);

    router.post('/checkTemporaryPassword',
        body('email').isEmail(),
        body('code').isString().notEmpty(), adminsController.confirmTemporaryPassword);

    router.patch('/changePasswordByCode',
        body('email').isEmail(),
        body('password').isString().notEmpty(),
        body('code').isString().notEmpty(), adminsController.changePasswordByCode);

    router.patch('/changePassword',
        roleMiddleware(adminAccess),
        body('email').isEmail(),
        body('password').isString().notEmpty(),
        body('oldPassword').isString().notEmpty(), adminsController.changePasswordByOldPassword);

    router.patch('/changeName',
        roleMiddleware(adminAccess),
        body('newName').isString(), adminsController.changeName);

    return router;
}
