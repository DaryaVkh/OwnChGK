import express, {Request, Response, Router} from 'express';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import GamesController from '../controllers/gamesController';

const router = Router();
const gamesController = new GamesController();

router.get('/', middleware, gamesController.getAll);
router.get('/game', gamesController.getGame);
router.get('/teams', gamesController.getAllTeams);
router.patch('/status', gamesController.changeGameStatus);
router.patch('/name', gamesController.editGameName);
router.patch('/admin', gamesController.editGameAdmin);
router.delete('/game', gamesController.deleteGame);

router.post('/', (req: Request, res: Response) => gamesController.insertGame(req, res));

export default router;