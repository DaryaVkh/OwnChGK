import {Router} from 'express';
import {AdminsController} from '../controllers/adminsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {adminAccess, superAdminAccess} from "./mainRouter";

export const adminsRouter = () => {
    const router = Router();

    const adminsController = new AdminsController();

    router.get('/', roleMiddleware(adminAccess), adminsController.getAll);
    router.post('/login', adminsController.login);
    router.post('/add', roleMiddleware(superAdminAccess), adminsController.insert);
    router.post('/logout', adminsController.logout);
    router.post('/delete', roleMiddleware(superAdminAccess), adminsController.delete);
    router.post('/sendMail', adminsController.sendPasswordWithTemporaryPassword);
    router.post('/checkTemporaryPassword', adminsController.confirmTemporaryPassword);
    router.patch('/changePasswordByCode', adminsController.changePasswordByCode);
    router.patch('/changePassword', adminsController.changePasswordByOldPassword);

    return router;
}
