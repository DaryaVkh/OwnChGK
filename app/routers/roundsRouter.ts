import express, {Request, Response, Router} from 'express';
import RoundsController from '../controllers/roundsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';

const router = Router();
const roundController = new RoundsController();

router.get('/', middleware, roundController.getAll);
router.patch('/settings', roundController.editRound);
router.delete('/team', roundController.deleteRound);

router.post('/', (req: Request, res: Response) => roundController.insertRound(req, res));

export default router;