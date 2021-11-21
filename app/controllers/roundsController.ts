/*import DataBase from '../dbconfig/dbconnector';*/
import {getCustomRepository} from 'typeorm';
import {RoundRepository} from '../db/repositories/roundRepository';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';


export class RoundsController {
    private readonly roundRepository = getCustomRepository(RoundRepository);

    public async getAll(req: Request, res: Response) {
        try {
            const gameName = req.body.gameName;
            const rounds = await this.roundRepository.findByGameName(gameName);
            res.status(200).json(rounds);
        } catch (error) {
            res.status(400).json({message: 'Error'}).send(error);
        }
    }

    public async insertRound(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {
                number,
                gameName,
                questionCount,
                questionCost,
                questionTime
            } = req.body;
            await this.roundRepository.insertByParams(number, gameName, questionCount, questionCost, questionTime);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async deleteRound(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameName, number} = req.body;
            await this.roundRepository.deleteByGameNameAndNumber(gameName, number);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }

    public async editRound(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {
                number,
                gameName,
                newQuestionCount,
                newQuestionCost,
                newQuestionTime
            } = req.body;
            await this.roundRepository.updateByParams(number, gameName, newQuestionCount, newQuestionCost, newQuestionTime);
            res.status(200).json({});
        } catch (error: any) {
            res.status(400).json({'message': error.message});
        }
    }
}