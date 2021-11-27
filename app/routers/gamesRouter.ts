import {Router} from 'express';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import {GamesController} from '../controllers/gamesController';
import {adminAccess} from "./mainRouter";

export const gamesRouter = () => {
    const router = Router();

    const gamesController = new GamesController();

    router.get('/', middleware, gamesController.getAll);
    router.get('/:gameName', middleware, gamesController.getGame);
    router.get('/:gameName/teams', middleware, gamesController.getAllTeams);
    router.patch('/:gameName/change', roleMiddleware(adminAccess), gamesController.changeGame)
    router.patch('/:gameName/changeStatus', roleMiddleware(adminAccess), gamesController.changeGameStatus);
    router.patch('/:gameName/changeName', roleMiddleware(adminAccess), gamesController.editGameName);
    router.patch('/:gameName/changeAdmin', roleMiddleware(adminAccess), gamesController.editGameAdmin);
    router.delete('/:gameName', roleMiddleware(adminAccess), gamesController.deleteGame);

    router.post('/', roleMiddleware(adminAccess), gamesController.insertGame);

    return router;
}