import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {TeamRepository} from '../db/repositories/teamRepository';
import {Request, Response} from 'express';


export class TeamsController {
    private readonly teamRepository = getCustomRepository(TeamRepository);

    public async getAll(req: Request, res: Response) {
        try {
            const teams = await this.teamRepository.find()
            res.status(200).json({
                teams: teams.map(value => value.name)
            });
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async getAllGames(req: Request, res: Response) {
        try {
            const {teamName} = req.body;
            const team = await this.teamRepository.findByName(teamName);
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
            await this.teamRepository.insertByNameAndUserEmail(teamName, captain);
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
            const name = req.body.name;
            await this.teamRepository.deleteByName(name);
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
            const name = req.body.name;
            const newName = req.body.newName;
            await this.teamRepository.updateByNames(name, newName)
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
            const {name, captain} = req.body;
            await this.teamRepository.updateByNameAndNewUserEmail(name, captain);
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
            const {name} = req.body;
            const team = await this.teamRepository.findOne({name});
            res.status(200).json(team);
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    // не актуально
    /*public async changeTeamParticipants(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const team = await DataBase.changeTeamParticipants(req.body.name, req.body.participants);
            res.send(team);
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }*/
}