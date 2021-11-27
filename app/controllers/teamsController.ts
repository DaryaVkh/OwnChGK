import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {TeamRepository} from '../db/repositories/teamRepository';
import {Request, Response} from 'express';


export class TeamsController {
    public async getAll(req: Request, res: Response) {
        try {
            const teams = await getCustomRepository(TeamRepository).find();
            res.status(200).json({
                teams: teams.map(value => value.name)
            });
        } catch (error) {
            res.status(400).json({message: 'Error', errors: error});
        }
    }

    public async getAllGames(req: Request, res: Response) {
        try {
            const {teamName} = req.params;
            const team = await getCustomRepository(TeamRepository).findByName(teamName);
            res.status(200).json(team.games.map(game => game.name));
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async insertTeam(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {teamName, captain} = req.body;
            await getCustomRepository(TeamRepository).insertByNameAndUserEmail(teamName, captain);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async deleteTeam(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {teamName} = req.params;
            await getCustomRepository(TeamRepository).deleteByName(teamName);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editTeam(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {teamName} = req.params;
            const {newTeamName, captain} = req.body;
            await getCustomRepository(TeamRepository).updateByParams(teamName, newTeamName, captain);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editTeamCaptain(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {teamName} = req.params;
            const {captain} = req.body;
            await getCustomRepository(TeamRepository).updateByNameAndNewUserEmail(teamName, captain);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async getTeam(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {teamName} = req.params;
            const team = await getCustomRepository(TeamRepository).findByName(teamName);
            res.status(200).json({
                name: team.name,
                captain: team.captain === null ? null : team.captain.email
            });
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }
}