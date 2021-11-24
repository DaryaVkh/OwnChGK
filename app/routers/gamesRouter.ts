import {Router} from 'express';
import {roleMiddleware} from '../middleware/roleMiddleware';
import {middleware} from '../middleware/middleware';
import {GamesController} from '../controllers/gamesController';

export const gamesRouter = () => {
    const router = Router();

    const gamesController = new GamesController();

    router.get('/', middleware, gamesController.getAll);
    router.get('/:gameName', middleware, gamesController.getGame);
    router.get('/:gameName/teams', middleware, gamesController.getAllTeams);
    router.patch('/:gameName/change', roleMiddleware(true), gamesController.changeGame)
    router.patch('/:gameName/changeStatus', roleMiddleware(true), gamesController.changeGameStatus);
    router.patch('/:gameName/changeName', roleMiddleware(true), gamesController.editGameName);
    router.patch('/:gameName/changeAdmin', roleMiddleware(true), gamesController.editGameAdmin);
    router.delete('/:gameName', roleMiddleware(true), gamesController.deleteGame);

    router.post('/', roleMiddleware(true), gamesController.insertGame);

    return router;
}