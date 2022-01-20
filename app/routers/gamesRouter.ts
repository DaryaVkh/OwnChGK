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
    //router.get('/:gameName/teams', middleware, gamesController.getAllTeams); // не используется, teams есть в getGame
    router.patch('/:gameId/change', roleMiddleware(adminAccess), gamesController.changeGame)
    router.patch('/:gameId/changeStatus', roleMiddleware(adminAccess), gamesController.changeGameStatus);
    router.patch('/:gameId/changeIntrigueStatus', roleMiddleware(adminAccess), gamesController.changeIntrigueStatus);
    router.patch('/:gameId/changeName', roleMiddleware(adminAccess), gamesController.editGameName);
    router.patch('/:gameId/changeAdmin', roleMiddleware(adminAccess), gamesController.editGameAdmin);
    router.delete('/:gameId', roleMiddleware(adminAccess), gamesController.deleteGame);
    router.get('/:gameId/result', middleware, gamesController.getGameResult);
    router.get('/:gameId/resultTable', middleware, gamesController.getGameResultScoreTable);
    router.get('/:gameId/resultTable/format', middleware, gamesController.getResultWithFormat);

    router.post('/', roleMiddleware(adminAccess), gamesController.insertGame);

    return router;
}