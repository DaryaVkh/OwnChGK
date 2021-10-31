import express, {Request, Response, Router} from 'express';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import GamesController from '../controllers/gamesController';

const router = Router();
const gamesController = new GamesController();

router.get('/', middleware, gamesController.getAll);
router.get('/game', middleware, gamesController.getGame);
router.get('/teams', middleware, gamesController.getAllTeams);
router.patch('/status', roleMiddleware(true), gamesController.changeGameStatus);
router.patch('/name', roleMiddleware(true), gamesController.editGameName);
router.patch('/admin', roleMiddleware(true), gamesController.editGameAdmin);
router.delete('/game', roleMiddleware(true), gamesController.deleteGame);

router.post('/', roleMiddleware(true), gamesController.insertGame);

export default router;