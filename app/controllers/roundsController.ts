import {getCustomRepository} from 'typeorm';
import {RoundRepository} from '../db/repositories/roundRepository';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';


export class RoundsController {
    public async getAll(req: Request, res: Response) {
        try {
            const {gameName} = req.body;
            const rounds = await getCustomRepository(RoundRepository).findByGameName(gameName);
            return res.status(200).json(rounds);
        } catch (error) {
            return res.status(400).json({message: 'Error'}).send(error);
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
            if (!number ||
                !gameName ||
                !questionCount ||
                !questionCost ||
                !questionTime) {
                return res.status(400).json({message: 'params is invalid'});
            }
            await getCustomRepository(RoundRepository).insertByParams(
                number,
                gameName,
                questionCount,
                questionCost,
                questionTime);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async deleteRound(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId, number} = req.params;
            await getCustomRepository(RoundRepository).deleteByGameNameAndNumber(gameId, +number);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }

    public async editRound(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка', errors})
            }
            const {gameId, number} = req.params;
            const {
                newQuestionCount,
                newQuestionCost,
                newQuestionTime
            } = req.body;
            await getCustomRepository(RoundRepository).updateByParams(+number, gameId, newQuestionCount, newQuestionCost, newQuestionTime);
            return res.status(200).json({});
        } catch (error: any) {
            return res.status(400).json({'message': error.message});
        }
    }
}