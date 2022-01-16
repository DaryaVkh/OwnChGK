import {Router} from 'express';
import {AdminsController} from '../controllers/adminsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {adminAccess, superAdminAccess} from "./mainRouter";

export const adminsRouter = () => {
    const router = Router();

    const adminsController = new AdminsController();

    router.get('/', roleMiddleware(adminAccess), adminsController.getAll);
    router.post('/login', adminsController.login);
    router.post('/insert', roleMiddleware(superAdminAccess), adminsController.insert);
    router.post('/logout', adminsController.logout);
    router.post('/delete', roleMiddleware(superAdminAccess), adminsController.delete);
    router.post('/sendMail', adminsController.sendPasswordWithTemporaryPassword);
    router.post('/checkTemporaryPassword', adminsController.confirmTemporaryPassword);
    router.patch('/changePasswordByCode', adminsController.changePasswordByCode);
    router.patch('/changePassword', roleMiddleware(adminAccess), adminsController.changePasswordByOldPassword);
    router.patch('/changeName', roleMiddleware(adminAccess), adminsController.changeName);

    return router;
}
