import {Router} from 'express';
import {TeamsController} from '../controllers/teamsController';
import {middleware} from '../middleware/middleware';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {adminAccess} from "./mainRouter";
import {body, param, query} from "express-validator";

export const teamsRouter = () => {
    const router = Router();

    const teamsController = new TeamsController();

    router.get('/',
        middleware,
        query('withoutUser').optional().isBoolean(), teamsController.getAll);

    router.get('/:teamId',
        middleware,
        param('teamId').isUUID(), teamsController.getTeam);

    router.patch('/:teamId/change',
        middleware,
        param('teamId').isUUID(),
        body('newTeamName').isString().notEmpty(),
        body('captain').optional({nullable: true}).isEmail(), teamsController.editTeam); // TODO: нет проверки кто меняет, сейчас могут все - и юзеры, и админы

    router.patch('/:teamId/changeCaptain',
        middleware,
        param('teamId').isUUID(), teamsController.editTeamCaptainByCurrentUser);

    router.delete('/:teamId',
        roleMiddleware(adminAccess),
        param('teamId').isUUID(), teamsController.deleteTeam);

    router.post('/',
        middleware,
        body('teamName').isString().notEmpty(),
        body('captain').isEmail(), teamsController.insertTeam);

    return router;
}
