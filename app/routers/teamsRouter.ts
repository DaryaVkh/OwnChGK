import {Router} from 'express';
import {TeamsController} from '../controllers/teamsController';
import {middleware} from '../middleware/middleware';

export class TeamsRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.config();
    }

    private config() {
        const teamsController = new TeamsController();

        this.router.get('/', middleware, teamsController.getAll);
        this.router.get('/team', middleware, teamsController.getTeam);
        this.router.get('/games', middleware, teamsController.getAllGames);
        this.router.patch('/teamName', middleware, teamsController.editTeam);
        this.router.patch('/teamCaptain', middleware, teamsController.editTeamCaptain);
        this.router.delete('/team', middleware, teamsController.deleteTeam);

        this.router.post('/', middleware, teamsController.insertTeam);
    }
}