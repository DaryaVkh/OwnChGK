import express, {Request, Response, Router} from 'express';
import {check} from 'express-validator';
import AdminsController from '../controllers/adminsController';
import {middleware} from '../middleware/middleware';
import {roleMiddleware} from '../middleware/roleMiddleware';

const router = Router();
const adminsController = new AdminsController();

router.get('/', roleMiddleware(true), adminsController.getAll);
router.post('/login', adminsController.login);
router.post('/add', adminsController.insert);

export default router;