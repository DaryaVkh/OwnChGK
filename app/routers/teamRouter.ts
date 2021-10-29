import express, {Request, Response, Router} from 'express';
import TeamsController from '../controllers/teamsController';
import {roleMiddleware} from "../middleware/roleMiddleware";
import {middleware} from "../middleware/middleware";

const router = Router();
const teamsController = new TeamsController();

router.get('/', middleware, teamsController.getAll);
router.get('/team', teamsController.getTeam);
router.get('/games', teamsController.getAllGames);
router.patch('/teamName', teamsController.editTeam);
router.patch('/teamCaptain', teamsController.editTeamCaptain);
router.delete('/team', teamsController.deleteTeam);

router.post('/', (req: Request, res: Response) => teamsController.insertTeam(req, res));

export default router;