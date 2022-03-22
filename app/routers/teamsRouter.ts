import {Router} from 'express';
import {TeamsController} from '../controllers/teamsController';
import {middleware} from '../middleware/middleware';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {adminAccess} from "./mainRouter";

export const teamsRouter = () => {
    const router = Router();

    const teamsController = new TeamsController();

    router.get('/', middleware, teamsController.getAll);
    router.get('/:teamId', middleware, teamsController.getTeam);
    router.patch('/:teamId/change', middleware, teamsController.editTeam);
    router.patch('/:teamId/changeCaptain', middleware, teamsController.editTeamCaptainByCurrentUser);
    router.patch('/:teamId/deleteCaptain', middleware, teamsController.editTeamCaptainByDeleteCurrentUser);
    router.delete('/:teamId', roleMiddleware(adminAccess), teamsController.deleteTeam);

    router.post('/', middleware, teamsController.insertTeam);

    return router;
}
