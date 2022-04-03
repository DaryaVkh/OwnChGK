import {Router} from 'express';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import {GamesController} from '../controllers/gamesController';
import {adminAccess} from "./mainRouter";
import {body, param, query} from 'express-validator';
import {GameStatus} from "../db/entities/Game";
import {validateGameStatus} from "../validators";

export const gamesRouter = () => {
    const router = Router();

    const gamesController = new GamesController();

    router.get('/',
        middleware,
        query('amIParticipate').optional().isBoolean(), gamesController.getAll);

    router.get('/:gameId',
        middleware,
        param('gameId').isUUID(), gamesController.getGame);

    router.get('/:gameId/start',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(), gamesController.startGame);

    router.get('/:gameId/participants',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(), gamesController.getParticipants);

    router.patch('/:gameId/change',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(),
        body('newGameName').isString().notEmpty(),
        body('roundCount').isInt({min: 0}),
        body('questionCount').isInt({min: 0}),
        body('teams').isArray(), gamesController.changeGame)

    router.patch('/:gameId/changeStatus',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(),
        body('status').custom(validateGameStatus), gamesController.changeGameStatus);

    router.patch('/:gameId/changeIntrigueStatus',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(),
        body('isIntrigue').isBoolean(), gamesController.changeIntrigueStatus);

    router.patch('/:gameId/changeName',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(),
        body('newGameName').isString().notEmpty(), gamesController.editGameName);

    router.patch('/:gameId/changeAdmin',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(),
        body('adminEmail').isEmail(), gamesController.editGameAdmin); // Не используется

    router.delete('/:gameId',
        roleMiddleware(adminAccess),
        param('gameId').isUUID(), gamesController.deleteGame);

    router.get('/:gameId/result',
        middleware,
        param('gameId').isUUID(), gamesController.getGameResult);

    router.get('/:gameId/resultTable',
        middleware,
        param('gameId').isUUID(), gamesController.getGameResultScoreTable);

    router.get('/:gameId/resultTable/format',
        middleware,
        param('gameId').isUUID(), gamesController.getResultWithFormat);

    router.post('/',
        roleMiddleware(adminAccess),
        body('gameName').isString().notEmpty(),
        body('roundCount').isInt({min: 0}),
        body('questionCount').isInt({min: 0}),
        body('teams').isArray(), gamesController.insertGame);

    return router;
}