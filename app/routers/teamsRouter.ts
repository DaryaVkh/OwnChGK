import express, {Request, Response, Router} from 'express';
import TeamsController from '../controllers/teamsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';

const router = Router();
const teamsController = new TeamsController();

router.get('/', middleware, teamsController.getAll);
router.get('/team', middleware, teamsController.getTeam);
router.get('/games', middleware, teamsController.getAllGames);
router.patch('/teamName', middleware, teamsController.editTeam);
router.patch('/teamCaptain', middleware, teamsController.editTeamCaptain);
router.delete('/team', middleware, teamsController.deleteTeam);

router.post('/', middleware, teamsController.insertTeam);

export default router;