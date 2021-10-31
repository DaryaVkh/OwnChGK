import express, {Request, Response, Router} from 'express';
import RoundsController from '../controllers/roundsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';

const router = Router();
const roundsController = new RoundsController();

router.get('/', middleware, roundsController.getAll);
router.patch('/settings', roleMiddleware(true), roundsController.editRound);
router.delete('/team', roleMiddleware(true), roundsController.deleteRound);

router.post('/', (req: Request, res: Response) => roundsController.insertRound(req, res));

export default router;