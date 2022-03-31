import {Router} from 'express';
import {RoundsController} from '../controllers/roundsController';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import {adminAccess} from "./mainRouter";
import {body, param} from "express-validator";

export const roundsRouter = () => {
    const router = Router();

    const roundsController = new RoundsController();

    // Пока не используется
    router.get('/',
        middleware,
        body('gameName').isString().notEmpty(), roundsController.getAll);

    router.patch('/:gameId/:number/change',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(),
        param('number').isInt(),
        body('newQuestionCount').isInt({min: 0}),
        body('newQuestionCost').isInt({min: 0}),
        body('newQuestionTime').isInt({min: 0}), roundsController.editRound);

    router.delete('/:gameId/:number',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(),
        param('number').isInt(), roundsController.deleteRound);

    router.post('/',
        roleMiddleware(adminAccess),
        body('number').isInt(),
        body('gameName').isString().notEmpty(),
        body('questionCount').isInt({min: 0}),
        body('questionCost').isInt({min: 0}),
        body('questionTime').isInt({min: 0}), roundsController.insertRound);

    return router;
}
