import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {TeamRepository} from '../db/repositories/teamRepository';
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {secret} from '../jwtToken';
import {TeamDTO} from '../dto';


export class TeamsController {
    public async getAll(req: Request, res: Response) {
        try {
            const {withoutUser} = req.query;
            const teams = withoutUser ?
                await getCustomRepository(TeamRepository).findTeamsWithoutUser()
                : await getCustomRepository(TeamRepository).find();
            return res.status(200).json({
                teams: teams.map(value => new TeamDTO(value))
            });
        } catch (error) {
            return res.status(400).json({message: 'Error', errors: error});
        }
    }

    public async getAllGames(req: Request, res: Response) {
        try {
            const {teamName} = req.params;
            const team = await getCustomRepository(TeamRepository).findByName(teamName);
            return res.status(200).json(team.games.map(game => game.name));
        } catch (error) {
            return res.status(400).json({message: 'Error'}).send(error);
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
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
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
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
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
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async editTeamCaptainByCurrentUser(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {teamName} = req.params;
            const token = req.cookies['authorization'];
            const {id: userId} = jwt.verify(token, secret) as jwt.JwtPayload;
            await getCustomRepository(TeamRepository).updateEmptyTeamByNameAndUserEmail(teamName, userId);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
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
            return res.status(200).json({
                name: team.name,
                captain: team.captain === null ? null : team.captain.email
            });
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }
}