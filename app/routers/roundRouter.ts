import express, {Request, Response, Router} from 'express';
import RoundController from '../controllers/roundController';
import {roleMiddleware} from "../middleware/roleMiddleware";
import {middleware} from "../middleware/middleware";

const router = Router();
const roundController = new RoundController();

router.get('/', middleware, roundController.getAll);;
router.patch('/settings', roundController.editRound);
router.delete('/team', roundController.deleteRound);

router.post('/', (req: Request, res: Response) => roundController.insertRound(req, res));

export default router;