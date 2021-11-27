import {Router} from 'express';
import {TeamsController} from '../controllers/teamsController';
import {middleware} from '../middleware/middleware';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {adminAccess} from "./mainRouter";

export const teamsRouter = () => {
    const router = Router();

    const teamsController = new TeamsController();

    router.get('/', middleware, teamsController.getAll);
    router.get('/:teamName', middleware, teamsController.getTeam);
    router.get('/:teamName/games', middleware, teamsController.getAllGames);
    router.patch('/:teamName/change', middleware, teamsController.editTeam);
    router.patch('/:teamName/changeCaptain', roleMiddleware(adminAccess), teamsController.editTeamCaptain);
    router.delete('/:teamName', roleMiddleware(adminAccess), teamsController.deleteTeam);

    router.post('/', middleware, teamsController.insertTeam);

    return router;
}
