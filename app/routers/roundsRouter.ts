import {Router} from 'express';
import {RoundsController} from '../controllers/roundsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';

export const roundsRouter = () => {
    const router = Router();

    const roundsController = new RoundsController();

    router.get('/', middleware, roundsController.getAll);
    router.patch('/:gameName/:number/change', roleMiddleware(true), roundsController.editRound);
    router.delete('/:gameName/:number', roleMiddleware(true), roundsController.deleteRound);

    router.post('/', () => roundsController.insertRound);

    return router;
}
