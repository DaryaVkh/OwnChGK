import {Router} from 'express';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import {GamesController} from '../controllers/gamesController';
import {adminAccess} from "./mainRouter";

export const gamesRouter = () => {
    const router = Router();

    const gamesController = new GamesController();

    router.get('/', middleware, gamesController.getAll);
    router.get('/:gameId', middleware, gamesController.getGame);
    router.get('/:gameId/start', roleMiddleware(adminAccess), gamesController.startGame);
    router.get('/:gameName/teams', middleware, gamesController.getAllTeams);
    router.patch('/:gameId/change', roleMiddleware(adminAccess), gamesController.changeGame)
    router.patch('/:gameName/changeStatus', roleMiddleware(adminAccess), gamesController.changeGameStatus);
    router.patch('/:gameName/changeName', roleMiddleware(adminAccess), gamesController.editGameName);
    router.patch('/:gameName/changeAdmin', roleMiddleware(adminAccess), gamesController.editGameAdmin);
    router.delete('/:gameName', roleMiddleware(adminAccess), gamesController.deleteGame);
    router.get('/:gameId/result', middleware, gamesController.getGameResult);
    router.get('/:gameId/resultTable', middleware, gamesController.getGameResultScoreTable);
    router.get('/:gameId/resultTable/format', middleware, gamesController.getResultWithFormat);

    router.post('/', roleMiddleware(adminAccess), gamesController.insertGame);

    return router;
}