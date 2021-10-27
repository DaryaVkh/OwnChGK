import express, {Request, Response, Router} from 'express';
import TeamsController from '../controllers/teamsController';
import {roleMiddleware} from "../middleware/roleMiddleware";
import {middleware} from "../middleware/middleware";

const router = Router();
const teamsController = new TeamsController();

router.get('/getAll', middleware, teamsController.getAll);
router.get('/getTeam', teamsController.getTeam);
router.patch('/editTeam', teamsController.editTeam);
router.patch('/editTeamCaptain', teamsController.editTeamCaptain);
router.delete('/team', teamsController.deleteTeam);

router.post('/insert', (req: Request, res: Response) => teamsController.insertTeam(req, res));

export default router;