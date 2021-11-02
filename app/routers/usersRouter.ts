import express, {Request, Response, Router} from 'express';
import {check} from 'express-validator';
import UsersController from '../controllers/usersController';
import {middleware} from '../middleware/middleware';
import {roleMiddleware} from '../middleware/roleMiddleware';

const router = Router();
const usersController = new UsersController();

router.get('/', middleware, usersController.getAll);
router.post('/login', usersController.login);
router.post('/insert', usersController.insert);

export default router;