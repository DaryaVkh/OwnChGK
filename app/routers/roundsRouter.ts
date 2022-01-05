import {Router} from 'express';
import {RoundsController} from '../controllers/roundsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import {adminAccess} from "./mainRouter";

export const roundsRouter = () => {
    const router = Router();

    const roundsController = new RoundsController();

    router.get('/', middleware, roundsController.getAll);
    router.patch('/:gameName/:number/change', roleMiddleware(adminAccess), roundsController.editRound);
    router.delete('/:gameName/:number', roleMiddleware(adminAccess), roundsController.deleteRound);

    router.post('/', () => roundsController.insertRound);

    return router;
}
