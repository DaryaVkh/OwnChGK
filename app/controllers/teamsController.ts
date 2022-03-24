import {validationResult} from 'express-validator';
import {getCustomRepository} from 'typeorm';
import {TeamRepository} from '../db/repositories/teamRepository';
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {generateAccessToken, secret} from '../jwtToken';
import {TeamDTO} from '../dto';
import {UserRepository} from "../db/repositories/userRepository";


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
            const {teamId} = req.params;
            if (!teamId) {
                return res.status(400).json({message: 'teamId is invalid'});
            }
            await getCustomRepository(TeamRepository).delete(teamId);
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
            const {teamId} = req.params;
            if (!teamId) {
                return res.status(400).json({message: 'teamId is invalid'});
            }
            const {newTeamName, captain} = req.body;
            await getCustomRepository(TeamRepository).updateByParams(teamId, newTeamName, captain);
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
            const {teamId} = req.params;
            if (!teamId) {
                return res.status(400).json({message: 'teamId is invalid'});
            }
            const token = req.cookies['authorization'];
            const {id: userId} = jwt.verify(token, secret) as jwt.JwtPayload;
            await getCustomRepository(TeamRepository).updateEmptyTeamByIdAndUserEmail(teamId, userId);
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
            const {teamId} = req.params;
            if (!teamId) {
                return res.status(400).json({message: 'teamId is invalid'})
            }
            const team = await getCustomRepository(TeamRepository).findOne(teamId, {relations: ['captain']});
            if (!team) {
                return res.status(404).json({message: 'team not found'});
            }
            return res.status(200).json({
                name: team.name,
                captain: team.captain === null ? null : team.captain.email
            });
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async deleteTeamCaptainById(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }

            const {teamId} = req.params;
            const oldToken = req.cookies['authorization'];
            const {
                id: userId,
                email: email,
                roles: userRoles,
                name: name
            } = jwt.verify(oldToken, secret) as jwt.JwtPayload;
            const user = await getCustomRepository(UserRepository).findOne(+userId, {relations: ['team']})
            if (user.team.id === +teamId) {
                await getCustomRepository(TeamRepository).deleteTeamCaptainByIdAndUserEmail(teamId);
                const token = generateAccessToken(userId, email, userRoles, null, null, name);
                res.cookie('authorization', token, {
                    maxAge: 24 * 60 * 60 * 1000,
                    secure: true
                });
                return res.status(200).json({});
            }
            return res.status(403).json({message: "user not captain of this team"});

        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }
}