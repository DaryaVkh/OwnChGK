import DataBase from "../dbconfig/dbconnector";
import {validationResult} from "express-validator";
import {Request, Response} from "express";


class RoundController {
    public async getAll(req:Request, res:Response) {
        try {
            const rounds = await DataBase.getRounds(req.body.gameId);
            res.send(rounds);
        } catch (error) {
            res.status(400).json({message: "Error"}).send(error);
        }
    }

    public async insertRound(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const number = req.body.number;
            const gameId = req.body.gameId;
            const questionNumber = req.body.questionNumber;
            const questionCost = req.body.questionCost;
            const questionTime = req.body.questionTime;
            await DataBase.insertRound(number, gameId, questionNumber, questionCost, questionTime);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async deleteRound(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const gameId = req.body.gameId;
            const number = req.body.number;
            await DataBase.deleteRound(gameId, number);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editRound(req:Request, res:Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка", errors})
            }
            const gameId = req.body.gameId;
            const number = req.body.number;
            const newNumber = req.body.newNumber;
            const newQuestionNumber = req.body.newQuestionNumber;
            const newQuestionCost = req.body.newQuestionCost;
            const newQuestionTime = req.body.newQuestionTime;
            await DataBase.changeRoundSettings(gameId, number, newNumber, newQuestionNumber, newQuestionCost, newQuestionTime);
            res.send('Done');
        } catch (error:any) {
            res.status(400).json({'message': error.message});
        }
    }
}

export default RoundController;