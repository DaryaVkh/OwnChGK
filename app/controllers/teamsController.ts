import DataBase from "../dbconfig/dbconnector";
import {validationResult} from "express-validator";
import {Request, Response} from "express";


class TeamsController {
    public async getAll(req:Request, res:Response) {
        try {
            const teams = await DataBase.getAllTeams();
            res.send(teams);
        } catch (error) {
            res.status(400).json({message: "Error"}).send(error);
        }
    }

    public async insertTeam(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const name = req.body.name;
            const captain = req.body.captain;
            await DataBase.insertTeam(name, captain);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async deleteTeam(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const name = req.body.name;
            await DataBase.deleteTeam(name);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editTeam(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const name = req.body.name;
            const newName = req.body.newName;
            console.log(name);
            console.log(newName);
            console.log(req.body);
            await DataBase.changeTeamName(name, newName);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editTeamCaptain(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const name = req.body.name;
            const captain = req.body.captainId;
            await DataBase.changeTeamCaptainId(name, captain);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async getTeam(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const team = await DataBase.getTeam(req.body.name);
            res.send(team);
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async changeTeamParticipants(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const team = await DataBase.changeTeamParticipants(req.body.name, req.body.participants);
            res.send(team);
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }
}

export default TeamsController;